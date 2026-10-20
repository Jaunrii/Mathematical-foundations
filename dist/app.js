/* Original course interface. No textbook files are served by this application. */
const C=window.COURSE_DATA;
const $=s=>document.querySelector(s);
const escapeHtml=v=>String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const E=escapeHtml;
const key="probability-notebook-v1";
let answers={};
let persistent=true;
try{answers=JSON.parse(localStorage.getItem(key)||"{}");}catch{persistent=false;}
let toastTimer;
function toast(message){$("#toast").textContent=message;$("#toast").classList.add("show");clearTimeout(toastTimer);toastTimer=setTimeout(()=>$("#toast").classList.remove("show"),3000);}
function save(){try{localStorage.setItem(key,JSON.stringify(answers));return true;}catch{persistent=false;toast("本浏览器无法保存，请复制或导出答案。");return false;}}
function phaseDays(p){return C.curriculum.days.filter(d=>d.phase===p.id);}
function nav(){
  const query=$("#search").value.trim().toLowerCase();
  let html=`<a href="#home">课程首页</a><a href="#diagnostic">00 · 入学诊断</a><a href="#roadmap">60 天完整路线</a><a href="#method">学习、复习与考核</a><a href="#sources">教材与参考资料</a><div class="nav-label">正式课程 · 规划中</div>`;
  let matches=0;
  for(const p of C.curriculum.phases){
    const ds=phaseDays(p).filter(d=>!query||[d.title,d.goal,d.bridge,d.confusion,d.day].join(" ").toLowerCase().includes(query));
    if(!ds.length)continue;
    matches+=ds.length;
    html+=`<details ${query||location.hash.startsWith("#day-")&&ds.some(d=>location.hash===`#day-${d.day}`)?"open":""}><summary>${E(p.title)}</summary>${ds.map(d=>`<a href="#day-${d.day}"><span>${String(d.day).padStart(2,"0")}</span>${E(d.title)}</a>`).join("")}</details>`;
  }
  if(query&&!matches)html+=`<p class="empty">没有找到相关课程。</p>`;
  $("#navigation").innerHTML=html;
  document.querySelectorAll("nav a").forEach(a=>{const active=a.hash===(location.hash||"#home");a.classList.toggle("active",active);if(active)a.setAttribute("aria-current","page");});
}
const pending=`<div class="notice"><strong>当前是准备阶段，正式讲义尚未开课。</strong>你要求先完整观看指定课程视频。这个前提尚未完成，当前先做教材整理与课程准备；正式 60 天在前提完成后开始计数。目录中的第 1–60 天是课程规划，不能当作已完成的讲义。</div>`;
function home(){
  const cards=C.curriculum.phases.map((p,i)=>{const ds=phaseDays(p);return `<a class="phase-card" href="#day-${ds[0].day}"><span class="num">${String(i+1).padStart(2,"0")}</span><small>DAY ${String(ds[0].day).padStart(2,"0")}—${String(ds.at(-1).day).padStart(2,"0")}</small><h3>${E(p.title)}</h3><p>${E(ds[0].bridge)}</p></a>`;}).join("");
  return `<section class="hero"><div><div class="eyebrow">课程总览</div><h1>概率论与随机过程</h1><p>测度论、实分析、高等概率论、高维概率论与随机过程的 60 天自学课程。</p><div class="actions"><a class="button primary" href="#diagnostic">查看入学诊断 →</a><a class="button" href="#roadmap">查看学习路线</a></div></div></section>
  <div class="meta-strip"><div><strong>60 <small>正式学习日 · 含复习考核</small></strong></div><div><strong>2–3 h<small>每天的学习投入</small></strong></div><div><strong>08:00<small>北京时间 · 准备任务起点</small></strong></div></div>
  ${pending}<div class="section-heading"><h2>课程目录</h2><span>课程蓝图 / 可逐日查看</span></div><div class="phase-grid">${cards}</div>
  <section class="section-card"><h2>练习与考核</h2><p>每一章都要完成四件事：用自己的话解释，算一个具体例子，检查定理条件，把方法迁移到一个新问题。每天的答案提交到聊天后，再给出批改、补救和延迟复测。</p><a href="#method">查看考核要求 →</a></section>`;
}
function roadmap(){
  return `<div class="eyebrow">学习计划</div><h1>60 天完整路线</h1><p class="page-intro">正式课程的相对日序。第 7、14、21、28、35、42、49、56 天用于综合考核与补救；最后 4 天完成研究工具选择与综合应用。进度以实际理解为依据，诊断和等待材料不消耗这 60 天。</p>${pending}${C.curriculum.phases.map(p=>`<h2>${E(p.title)}</h2><table class="roadmap"><thead><tr><th>天</th><th>学习主题与可检验成果</th><th>类型</th></tr></thead><tbody>${phaseDays(p).map(d=>`<tr><td>${String(d.day).padStart(2,"0")}</td><td><a href="#day-${d.day}">${E(d.title)}</a><div class="subtle">${E(d.goal)}</div></td><td>${d.kind==="review"?"复习考核":"学习规划"}</td></tr>`).join("")}</tbody></table>`).join("")}`;
}
function day(n){
  const d=C.curriculum.days.find(d=>d.day===n);
  if(!d)return `<h1>未找到这一天</h1><a href="#roadmap">返回完整路线</a>`;
  const p=C.curriculum.phases.find(p=>p.id===d.phase);
  const lesson=C.lessons?.[n];
  return `<div class="eyebrow">DAY ${String(n).padStart(2,"0")} / ${E(p?.title)}</div><h1>${E(d.title)}</h1><div class="lesson-status"><span class="tag">${lesson?"已发布讲义":"课程规划 · 正文待编写"}</span><span class="date">预计学习 2–3 小时${d.kind==="review"?" · 复习考核日":""}</span></div>
  ${lesson?lesson.html:`<div class="notice">这里展示这一天的学习目标与设计。正式正文将在视频前提完成后逐日编写；当前没有把目录条目当作讲义交付。</div><div class="reading"><section class="section-card"><h2>学完后，你要能做到</h2><p>${E(d.goal)}</p></section><section class="section-card"><h2>这与概率有什么关系？</h2><p>${E(d.bridge)}</p></section><section class="section-card"><h2>要特别辨清的地方</h2><p>${E(d.confusion)}</p></section><section class="section-card"><h2>将如何检查理解</h2><p>${E(d.check)}</p></section><details class="reveal"><summary>展开：正式章节会包含什么</summary><ol>${C.policy.chapterRequirements.map(t=>`<li>${E(t)}</li>`).join("")}</ol></details></div>`}
  <div class="pagination">${n>1?`<a href="#day-${n-1}">← 第 ${n-1} 天</a>`:`<a href="#diagnostic">← 入学诊断</a>`}<a href="#roadmap">全部课程</a>${n<60?`<a href="#day-${n+1}">第 ${n+1} 天 →</a>`:`<a href="#method">考核与后续 →</a>`}</div>`;
}
function diagnostic(){
  const d=C.diagnostic;
  return `<div class="eyebrow">准备阶段 / 基础测验</div><h1>${E(d.title)}</h1><span class="tag">闭卷 · ${E(d.duration)}</span><span class="tag">8 题 · 总计 100 分</span><p class="page-intro">${E(d.instructions)}</p><div class="notice"><strong>作答后，请把答案复制回本聊天。</strong>这里的答案仅保存在当前浏览器，不会自动发送给我，也不会自动产生 AI 评分。换设备前请导出。提交及评估结果以聊天记录为准。</div>
  ${d.questions.map((q,i)=>`<section class="section-card"><div class="question-heading"><h2>${i+1}. ${E(q.title)}</h2><small>${q.points} 分</small></div><p>${E(q.text)}</p><label class="answer-label" for="${q.id}">你的思路、答案与把握程度</label><textarea id="${q.id}" data-answer="${q.id}" placeholder="填写答案、推理过程和把握程度。">${E(answers[q.id]||"")}</textarea></section>`).join("")}
  <section class="section-card"><h2>最后，补充你的学习背景</h2><ul>${d.reflection.map(x=>`<li>${E(x)}</li>`).join("")}</ul><label class="answer-label" for="reflection">学习背景与这次体验（不计分）</label><textarea id="reflection" data-answer="reflection">${E(answers.reflection||"")}</textarea></section>
  <section class="export-area"><h3>提交作答</h3><p class="subtle">生成答案后，复制到当前聊天发送。我会逐题批改，给出补课建议，再根据你的结果调整课程。</p><button id="export">生成可复制答案</button><button id="download">下载作答备份</button><span id="save-state" class="save-state">${persistent?"答案会自动保存在本浏览器":"当前浏览器保存不可用，请及时导出"}</span><div id="export-output"></div></section>`;
}
function exportText(){return `概率论与随机过程 · 入学诊断作答\n日期：${new Date().toLocaleDateString("zh-CN",{timeZone:"Asia/Shanghai"})}\n\n`+C.diagnostic.questions.map((q,i)=>`${i+1}. ${q.title}\n${answers[q.id]||"未作答"}\n`).join("\n")+`\n学习背景与体验：\n${answers.reflection||"未填写"}\n\n请逐题批改，标注概念/计算/条件/表达问题，并给出补救建议。`;}
function method(){
  return `<div class="reading"><div class="eyebrow">课程说明</div><h1>学习与考核</h1><p class="page-intro">目标是建立一个可以调用的概率工具箱：遇到问题时，知道该问什么、用哪个定理、怎样核实条件。60 天是第一轮系统训练，不是五门学科的全部深度。</p>
  <h2>每天 150 分钟，怎么分配</h2>
  ${[["15","闭卷回忆","回忆前 1、3、7、14 个学习日的概念。先答再翻，不靠熟悉感判断掌握。"],["55","带着问题读讲义","从问题到例子、定义、定理与用途。每次遇到符号，确认它代表什么对象。"],["40","独立练习","做解释题、计算题、条件检查和迁移题。把不确定写下来，不先看答案。"],["25","批改与补救","把答案提交到聊天，获得逐题反馈。用不同例子修正错误，保留错因。"],["15","建立知识连接","画出今天与已有知识的联系，写一张定理调用卡，并安排延迟复习。"]].map(x=>`<div class="step"><span class="stepnum">${x[0]}′</span><div><strong>${x[1]}</strong><p>${x[2]}</p></div></div>`).join("")}
  <p class="subtle">120 分钟版本：10 + 45 + 35 + 20 + 10；180 分钟版本：15 + 65 + 50 + 30 + 20。复习考核日用整段做测验、讲评与补救，不加新概念。</p>
  <h2>用概率问题带出分析工具</h2><div class="route"><span>事件和信息</span><b>→</b><span>σ-代数与测度</span><b>→</b><span>期望与积分</span><b>→</b><span>极限交换</span><b>→</b><span>统计与过程</span></div><p>例如，要回答“样本量越来越大，平均误差会怎样”，才引入不同的收敛方式；要回答“已知部分信息后怎样预测”，才引入条件期望。每个抽象概念都保留一个可反复使用的具体例子。</p>
  <h2>每个定理都配一张调用卡</h2><section class="section-card"><ol><li>我要解决哪类问题？</li><li>输入对象是什么，结论能给我什么？</li><li>每个条件怎么检查？</li><li>一个完整的使用例子。</li><li>删掉某个条件时，哪里可能失败？</li><li>与之前哪个工具相似，又有什么不同？</li></ol></section>
  <h2>怎样考核</h2><table class="score-table"><tbody><tr><td>概念解释：用自己的话解释，并给例子</td><td>25</td></tr><tr><td>计算与推理：步骤有效，能说明理由</td><td>25</td></tr><tr><td>条件检查与反例：知道何时不能用</td><td>25</td></tr><tr><td>迁移与表达：在新情境中选对工具</td><td>25</td></tr></tbody></table><p>这是正式课程的评分维度；入学诊断使用题目旁列出的分值。</p><ul><li><strong>80 分及以上且无核心概念错误：</strong>进入下一主题，并保留延迟复测。</li><li><strong>60–79 分：</strong>先用 20–30 分钟补救，再做一道变式。</li><li><strong>低于 60 分或有核心概念错误：</strong>补基础，缩减可选拓展，不硬推进依赖该概念的新内容。</li></ul><p>批改会保留你的原始答案、错因、修订答案和复测结果。没有交作业时只标为“未评估”；打开网页、读完、自报理解均不等于考核通过。</p>
  <h2>深度边界</h2><p>优先掌握测度与积分的概率语言、收敛与极限交换、条件期望、大数定律和中心极限定理、集中不等式，以及离散过程和经典连续过程的基本结构。外测度构造、一般测度分解的长证明、泛函分析全貌、完整随机微积分和一般随机过程理论留作后续。布朗运动先理解定义、协方差与路径性质；Itô 积分只作为后续入口。</p>
  <h2>什么会让进度调整</h2><p>诊断结果、每周考核和研究方向都会改变练习与选修内容。可以压缩拓展，不能为了凑足日历而删去理解所需的复习。正式起始日仍待视频前提完成；当前每日上午任务先服务于准备。</p></div>`;
}
function sources(){
  return `<div class="reading"><div class="eyebrow">参考资料 · ${E(C.catalog.checkedOn)}</div><h1>教材与参考资料</h1>
  <p class="page-intro">“高等概率论”文件夹及其子文件夹的完整目录：31 份 PDF，包含 19 个教材分卷文件、1 本学习指导、4 份课件、4 份习题与答案、3 份讲义与笔记。下列页数均为 PDF 页数。</p>
  <div class="notice"><strong>核查范围</strong>已核对书目信息、页数及各条目注明的页面，尚未精读全部资料，也未逐页检查所有文件的完整性。Cohn《Measure Theory》已确认残缺。网站列出资料索引，不提供原书 PDF。</div>
  <div class="catalog-tools"><label for="source-search">查找书名、作者或原文件名</label><input id="source-search" type="search" placeholder="例如：Shiryaev、胡太忠、GTM261" autocomplete="off">
  <div class="catalog-filters" role="group" aria-label="资料类型">${[["all","全部",31],["book","教材",19],["guide","学习指导",1],["slides","课件",4],["exercises","习题与答案",4],["notes","讲义与笔记",3]].map(([id,label,count])=>`<button type="button" data-source-filter="${id}" aria-pressed="${id==="all"}">${label} <span>${count}</span></button>`).join("")}</div><p id="source-count" class="subtle" role="status" aria-live="polite">共 31 份资料</p></div>
  <div id="source-catalog">${catalogEntries()}</div>
  <details class="reveal"><summary>各主要参考书在课程中的用途</summary>${C.sources.map(s=>`<h3>${E(s.title)}</h3><p>${E(s.role)}</p><p class="subtle">${E(s.note)}</p>`).join("")}</details>
  <h2>课程视频</h2><p>Claudio Landim · Probability Theory。指定 B 站合集共 26 段，总时长 27 小时 7 分 43 秒。教师风格研究由讲义编写方完成，无需学习者代看。</p>
  <p><strong>工具辅助审阅进度：${C.video.reviewedParts} / ${C.video.totalParts} 段。</strong>前 6 讲已由 vidIQ 完成音视频分析，报告覆盖时长共 6 小时 00 分 58 秒；已复核带时间戳的教学方法记录。尚余 20 段，整套课程的先决条件仍未完成。</p>
  <p class="subtle">研究重点是讲课方式、思路与逻辑，供原创讲义重新组织内容。以下观察来自视频分析报告，覆盖时长为工具报告声明；数学转述另行核查。前 6 讲的观察属于阶段性结论。</p>
  <details class="reveal"><summary>第 1–6 讲：如何把知识讲清楚</summary><p class="subtle">区分报告中的教学行为与本课程拟采用的方法；不照搬原话、原内容或原课堂顺序。</p>${C.video.findings.map(f=>`<section><h3>${E(f.title)}</h3><p>${E(f.observation)}</p><p>用于本讲义：${E(f.adaptation)}</p><p class="subtle">记录定位：${f.evidence.map(e=>`<a href="https://www.youtube.com/watch?v=${E(e.videoId)}&t=${e.seconds}s" target="_blank" rel="noopener">第 ${e.part} 讲 ${E(e.timestamp)}</a>`).join(" · ")}</p></section>`).join("")}</details>
  <ul><li><a href="https://www.bilibili.com/video/BV1u5411c79Y/" target="_blank" rel="noopener">指定 B 站课程</a></li><li><a href="https://www.youtube.com/playlist?list=PLo4jXE-LdDTS5BYqea-LcHdtjKwVcepP7" target="_blank" rel="noopener">IMPA 官方课程视频</a></li><li><a href="https://w3.impa.br/~landim/lectures.html" target="_blank" rel="noopener">教师官方课程页</a></li><li><a href="https://w3.impa.br/~landim/Cursos/PT.pdf" target="_blank" rel="noopener">官方配套评论与习题</a></li></ul>
  <h2>阅读形式</h2><p>参考 <a href="https://zh-v2.d2l.ai/" target="_blank" rel="noopener">《动手学深度学习》</a>的分章节阅读方式，提供目录、例子、练习和前后章连接。原项目的 <a href="https://github.com/d2l-ai/d2l-zh" target="_blank" rel="noopener">GitHub 仓库</a>可供了解实现形式。</p></div>`;
}
const sourceGroups=[["book","教材"],["guide","学习指导"],["slides","课程课件"],["exercises","习题与答案"],["notes","讲义与笔记"]];
function catalogEntries(query="",type="all"){
  const q=query.trim().toLowerCase();
  const files=C.catalog.files.filter(s=>(type==="all"||s.type===type)&&[s.title,s.authors.join(" "),s.relativePath,s.edition,s.note].join(" ").toLowerCase().includes(q));
  if(!files.length)return `<p class="empty">未找到匹配资料。可换用作者姓氏或清空筛选。</p>`;
  return sourceGroups.map(([id,label])=>{
    const group=files.filter(s=>s.type===id);
    if(!group.length)return "";
    return `<section class="catalog-group"><h2>${label}<span class="subtle"> ${group.length} 份</span></h2>${group.map(s=>`<article class="catalog-entry"><div class="catalog-meta">${E(s.authors.join("、")||"作者未核实")} · ${s.pages} PDF 页${s.edition?` · ${E(s.edition)}`:""}${s.completeness==="partial"?` <span class="tag">文件残缺</span>`:""}</div><h3>${E(s.title)}</h3><p>${E(s.note)}</p><details><summary>文件与核查记录</summary><p class="source-filename">${E(s.relativePath)}</p><p class="subtle">${E(s.verified)}</p></details></article>`).join("")}</section>`;
  }).join("");
}
function bind(){
  let sourceType="all";
  function filterSources(){
    const query=$("#source-search").value;
    $("#source-catalog").innerHTML=catalogEntries(query,sourceType);
    const count=$("#source-catalog").querySelectorAll(".catalog-entry").length;
    $("#source-count").textContent=`显示 ${count} / ${C.catalog.files.length} 份资料`;
    document.querySelectorAll("[data-source-filter]").forEach(el=>el.setAttribute("aria-pressed",String(el.dataset.sourceFilter===sourceType)));
  }
  $("#source-search")?.addEventListener("input",filterSources);
  document.querySelectorAll("[data-source-filter]").forEach(el=>el.addEventListener("click",()=>{sourceType=el.dataset.sourceFilter;filterSources();}));
  document.querySelectorAll("[data-answer]").forEach(el=>el.addEventListener("input",()=>{answers[el.dataset.answer]=el.value;const ok=save();$("#save-state").textContent=ok?"已保存到本浏览器 · 尚未提交":"保存不可用，请立即复制或导出";}));
  $("#export")?.addEventListener("click",()=>{$("#export-output").innerHTML=`<label class="answer-label" for="export-text">复制下面的文本到聊天</label><textarea id="export-text" readonly>${E(exportText())}</textarea><button id="copy">复制答案</button>`;$("#copy").addEventListener("click",async()=>{try{await navigator.clipboard.writeText(exportText());toast("已复制。请回到聊天粘贴并发送。");}catch{$("#export-text").focus();$("#export-text").select();toast("请使用系统复制操作复制选中的文本。");}});});
  $("#download")?.addEventListener("click",()=>{const blob=new Blob([exportText()],{type:"text/plain;charset=utf-8"});const u=URL.createObjectURL(blob);const a=document.createElement("a");a.href=u;a.download="probability-diagnostic-answers.txt";a.click();setTimeout(()=>URL.revokeObjectURL(u),1000);});
}
function render(){
  const hash=location.hash||"#home";
  let html=hash==="#home"?home():hash==="#roadmap"?roadmap():hash==="#diagnostic"?diagnostic():hash==="#method"?method():hash==="#sources"?sources():hash.startsWith("#day-")?day(Number(hash.slice(5))):`<h1>未找到这一页</h1><a href="#home">返回首页</a>`;
  $("#main").innerHTML=html;nav();bind();$("#sidebar").classList.remove("open");$("#menu").setAttribute("aria-expanded","false");window.scrollTo(0,0);document.title=($("#main h1")?.textContent||"概率论与随机过程")+" · 概率论与随机过程";
}
$("#search").addEventListener("input",nav);
$("#menu").addEventListener("click",()=>{$("#sidebar").classList.toggle("open");$("#menu").setAttribute("aria-expanded",String($("#sidebar").classList.contains("open")));});
window.addEventListener("hashchange",render);
render();
