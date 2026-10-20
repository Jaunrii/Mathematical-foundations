"""Build the browser data from reviewed course content; never reads sources PDFs."""
import json
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
if policy["videoPrerequisite"]["status"] != "completed":
    assert not lessons, "Formal lessons cannot be published before the video prerequisite"

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
      f"{len(lessons)} formal lessons.")
