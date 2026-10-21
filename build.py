"""Build the browser data from reviewed course content; never reads sources PDFs."""
import html
import json
import os
import re
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parent


def read(name):
    return json.loads((ROOT / name).read_text(encoding="utf-8"))


course = read("content/curriculum.json")
days = course["days"]
assert [d["day"] for d in days] == list(range(1, 61)), "Expected exactly 60 ordered days"
assert len({p["id"] for p in course["phases"]}) == len(course["phases"])
assert all(d["phase"] in {p["id"] for p in course["phases"]} for d in days)
diagnostic = read("content/diagnostic.json")
assert sum(q["points"] for q in diagnostic["questions"]) == 100
policy = read("course-policy.json")
video = read("content/video-review.json")
lessons_file = ROOT / "content/lessons.json"
lessons = json.loads(lessons_file.read_text()) if lessons_file.exists() else {}
prerequisite = policy["videoPrerequisite"]
if prerequisite.get("blocksFormalLessons", prerequisite.get("required", True)) and prerequisite["status"] != "completed":
    assert not lessons, "Formal lessons cannot be published before the video prerequisite"

formula_count = 0


def render_math(markup):
    """Compile reviewed lesson TeX to native MathML; invalid formulas fail the build."""
    global formula_count
    pattern = re.compile(r"\\\((.*?)\\\)|\\\[(.*?)\\\]", re.S)
    matches = list(pattern.finditer(markup))
    if not matches:
        return markup
    formulas = [{"tex": html.unescape(m.group(1) if m.group(1) is not None else m.group(2)),
                 "display": m.group(2) is not None} for m in matches]
    result = subprocess.run([os.environ.get("NODE_BINARY", "node"), str(ROOT / "render-math.js")],
                            input=json.dumps(formulas), text=True, capture_output=True, check=True)
    outputs = iter(json.loads(result.stdout))
    formula_count += len(formulas)
    return pattern.sub(lambda _: next(outputs), markup)


for key, lesson in lessons.items():
    assert str(int(key)) == key and 1 <= int(key) <= 60
    if "source" in lesson:
        source = (ROOT / "content" / lesson.pop("source")).resolve()
        assert source.is_relative_to((ROOT / "content/lessons").resolve())
        lesson["html"] = source.read_text(encoding="utf-8")
    assert lesson.get("html"), f"Missing lesson body: {key}"
    lesson["html"] = render_math(lesson["html"])
    questions = lesson["assessment"]["questions"]
    assert sum(q["points"] for q in questions) == 100
    assert len({q["id"] for q in questions}) == len(questions)
    for question in questions:
        question["promptHtml"] = render_math(html.escape(question["prompt"]).replace("\n", "<br>"))

data = {
    "curriculum": course,
    "diagnostic": diagnostic,
    "policy": {"chapterRequirements": policy["chapterRequirements"]},
    "sources": read("content/source-summaries.json"),
    "catalog": read("content/bibliography-catalog.json"),
    "video": {
        "reviewedParts": len(video["videoCoverage"]),
        "totalParts": video["parts"],
        "reviewedDurationSeconds": video.get("reviewedDurationSeconds", 0),
        "findings": video.get("teachingFindings", []),
    },
    "lessons": lessons,
}
out = ROOT / "dist/course-data.js"
out.write_text(
    "window.COURSE_DATA = " + json.dumps(data, ensure_ascii=False).replace("</", "<\\/") + ";\n",
    encoding="utf-8",
)
print(f"Built {len(days)} planned days, {len(diagnostic['questions'])} diagnostic questions, "
      f"{len(lessons)} formal lessons; rendered {formula_count} formulas.")
