// 무드핏 카드뉴스 빌더 v3 — 4유형(E·S·I·H) × 포맷 로테이션(F1~F7)
// 기준: moodfit-cardnews-production-guide-v3.md (v2 §4 언어 허법 우선, v3가 §3 해설주력 대체)
// 산출: 초기 4주 런칭 시퀀스 12게시물 (§5). 자가검수 체크리스트 + 게시계획(plan.md) 동반.
//
// §0 불변 원칙: 편한 형 반말 / 금지어(정답·트렌드·베스트·인기·핫·특가·저렴이·가성비·옷맹·요즘) /
//   복구 착지 / 공유어(꾸안못·팔로무드러) 주 합산 ≥2 / 정보는 마지막 한 줄만(I만 정보 1문장) /
//   caption 원문 미노출→구어 번역 / 앱 언급은 H에서만 / 경쟁·실존 브랜드·타 앱 언급 0.
//
// 완성가(H): 앱 MoodHero와 동일 산식(미드 티어 최저가 합산 72000+42000+33000+79000=226000 → "22.6만").

import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const IMG = (f) => `../../images/post/${f}`; // render/ 기준 — 승인본(fal 생성 .jpg)
// F7 완성가 = 사진별 실완성가(products photo_image_url 최저가 합, batch1/2 기준)
const LOOK_TOTAL = { "clean-001": "12.9만", "amekaji-014": "21.9만", "street-011": "6.9만" };

// ─────────────────────────────────────────────────────────────────────
// 콘텐츠 플랜 — 초기 4주 런칭 시퀀스 (§5)
//   W1 정체성 심기 E·S·E / W2 감각 증명 S·I·S / W3 확산 E·S·E / W4 첫 제품 E·S·H
//   같은 유형 연속 배치 금지(§1) → 각 주 E/S/I/H를 교차 배열. H는 금요일 고정.
//   공유어: 꾸안못(P1,P5,P9,P10) · 팔로무드러(P3,P4,P8,P11) → 매 주 합산 ≥2 (§0-4)
// ─────────────────────────────────────────────────────────────────────
const POSTS = [
  // ── W1 ────────────────────────────────────────────────────────────
  { id: "W1-1", week: 1, type: "E", day: "월", weekTitle: "정체성 심기",
    hashtags: ["#남자코디", "#데일리룩", "#꾸안못", "#옷장고민", "#무드핏"],
    cards: [
      { fmt: "F1", cover: true, lead: "세 번 갈아입고\n첫 옷으로 나왔다" },
      { fmt: "F1", lead: "처음 건 너무 밋밋한 것 같고" },
      { fmt: "F1", lead: "두 번째는 나 혼자 힘준 것 같고" },
      { fmt: "F1", lead: "세 번째는…\n그냥 아까 그게 나았다" },
      { fmt: "F1", accentWord: true, eyebrow: "이게 꾸안못이야",
        lead: "꾸미고 싶은데\n뭘 바꿔야 나아지는지\n모르는 거." },
      { fmt: "F1", save: true, eyebrow: "네 탓이 아니야",
        lead: "감각이 없는 게 아니라\n뭘 바꿀지 아무도 안 알려줬을 뿐.",
        sub: "저장해놨다가 또 옷장 앞에서 막히면 봐." },
    ] },

  { id: "W1-2", week: 1, type: "S", day: "수", weekTitle: "정체성 심기", axis: "클린",
    hashtags: ["#클린룩", "#화이트코디", "#남자코디", "#미니멀", "#무드핏"],
    cards: [
      { fmt: "F2", cover: true, img: "clean-001.jpg", pos: "center 18%", axis: "클린" },
      { fmt: "F2", img: "clean-001.jpg", pos: "center 42%", save: true, eyebrow: "봤어?",
        caption: "흰 티에 밝은 슬랙스.\n색을 안 늘렸을 뿐인데 대충 입어도 정돈돼 보이더라." },
    ] },

  { id: "W1-3", week: 1, type: "E", day: "금", weekTitle: "정체성 심기",
    hashtags: ["#팔로무드러", "#남자코디", "#옷고민", "#데일리룩", "#무드핏"],
    cards: [
      { fmt: "F4", cover: true, title: "친구",
        bubbles: [
          { s: "them", t: "나 이 니트 살까?" },
          { s: "me", t: "오 괜찮은데?" },
          { s: "them", t: "근데 나한테 어울릴까" },
          { s: "me", t: "무난하겠지 뭐" },
        ] },
      { fmt: "F4", title: "친구",
        bubbles: [
          { s: "them", t: "무난…" },
          { s: "them", t: "그거 좋은 거야?" },
          { s: "me", t: "…" },
        ] },
      { fmt: "F1", accentWord: true, eyebrow: "가만 보면",
        lead: "'무난하다'는\n아무 기억도 안 남는다는\n뜻이야." },
      { fmt: "F1", save: true, eyebrow: "네 탓이 아니야",
        lead: "무난한 게 아니라\n'무난' 말고 뭐라 부를지\n이름이 없었을 뿐.",
        sub: "팔로무드러들은 이걸 저장으로 모아둬." },
    ] },

  // ── W2 ────────────────────────────────────────────────────────────
  { id: "W2-1", week: 2, type: "S", day: "월", weekTitle: "감각 증명", axis: "아메카지",
    hashtags: ["#아메카지", "#청청코디", "#남자코디", "#워크웨어", "#무드핏"],
    cards: [
      // 004→001 교체: 014(헨리넥+워크팬츠)는 청청 아님. 001/002/008/013 전부 데님자켓+진 = 청청.
      { fmt: "F6", imgs: ["amekaji-002.jpg", "amekaji-013.jpg", "amekaji-008.jpg", "amekaji-001.jpg"],
        common: "위아래 다 청청인데 안 촌스러운 룩" },
      { fmt: "F1", save: true, eyebrow: "공통점?",
        lead: "안에 받친 색이\n다 달라.\n검정이든 크림이든.",
        sub: "청청을 한 톤으로 안 두는 거 — 팔로무드러들이 저장으로 모으는 결이야." },
    ] },

  { id: "W2-2", week: 2, type: "I", day: "수", weekTitle: "감각 증명", axis: "시티보이",
    hashtags: ["#시티보이", "#셔츠코디", "#남자코디", "#레이어드", "#무드핏"],
    cards: [
      // I의 한 판: F2훅 → F3주석 → F1정답 → F2착지 (§3.2)
      { fmt: "F2", img: "cityboy-001.jpg", pos: "center 22%", eyebrow: "뭐가 다를까",
        caption: "쟤는 뭐가 다른지 모르겠는데\n일단 달라 보이지." },
      { fmt: "F3", img: "cityboy-001.jpg", pos: "center 30%",
        markers: [{ x: 47, y: 40, label: "여기" }],
        note: "여기, 셔츠를 안 잠그고 걸쳤지?" },
      { fmt: "F1", accentWord: true, mustard: true, eyebrow: "이거 하나야",
        lead: "셔츠는 잠그는 것도,\n다 푸는 것도 아니야.\n'걸치듯' 열어서 안에 티가 보이면 층이 생겨." },
      { fmt: "F2", img: "cityboy-001.jpg", pos: "center 52%", save: true, eyebrow: "네 탓이 아니야",
        caption: "감각이 없어서가 아니라\n이 순서를 아무도 안 알려줬을 뿐. 이런 게 꾸안못이야." },
    ] },

  { id: "W2-3", week: 2, type: "S", day: "금", weekTitle: "감각 증명", axis: "클래식",
    hashtags: ["#클래식룩", "#무채색코디", "#코트", "#남자코디", "#무드핏"],
    cards: [
      { fmt: "F2", cover: true, img: "classic-001.jpg", pos: "center 30%", axis: "클래식" },
      { fmt: "F2", img: "classic-001.jpg", pos: "center 46%", save: true, eyebrow: "봤어?",
        caption: "올리브 코트에 네이비 터틀넥.\n톤을 다 어둡게 눌러서 세로로 각이 서더라." },
    ] },

  // ── W3 ────────────────────────────────────────────────────────────
  { id: "W3-1", week: 3, type: "E", day: "월", weekTitle: "확산 시도",
    hashtags: ["#꾸안못", "#니트코디", "#남자코디", "#옷고민", "#무드핏"],
    cards: [
      { fmt: "F4", cover: true, title: "친구",
        bubbles: [
          { s: "me", t: "그 니트 어디꺼야" },
          { s: "them", t: "너도 사 ㅋㅋ" },
          { s: "me", t: "나 입으면 안 어울릴 듯" },
          { s: "them", t: "왜" },
        ] },
      { fmt: "F4", title: "친구",
        bubbles: [
          { s: "me", t: "몰라" },
          { s: "me", t: "그냥 나만 이상해" },
        ] },
      { fmt: "F1", accentWord: true, eyebrow: "가만 보면",
        lead: "'나만 이상해'는\n감각 문제가 아니야." },
      { fmt: "F1", save: true, eyebrow: "네 탓이 아니야",
        lead: "같은 니트도 어디에 받치느냐에 따라\n딴 옷이 돼.",
        sub: "네가 이상한 게 아니라 받침을 몰랐을 뿐. 저장해두고 하나씩 봐." },
    ] },

  { id: "W3-2", week: 3, type: "S", day: "수", weekTitle: "확산 시도", axis: "스트릿",
    hashtags: ["#스트릿룩", "#오버핏", "#남자코디", "#후디코디", "#무드핏"],
    cards: [
      { fmt: "F2", cover: true, img: "street-001.jpg", pos: "center 20%", axis: "스트릿" },
      { fmt: "F2", img: "street-001.jpg", pos: "center 40%", save: true, eyebrow: "봤어?",
        caption: "위아래 다 크게. 대신 캡으로 위를 눌러서\n커 보이는 게 아니라 힘 뺀 것처럼 보여.",
        subcaption: "팔로무드러들 사이에서 스크랩 많은 스트릿." },
    ] },

  { id: "W3-3", week: 3, type: "E", day: "금", weekTitle: "확산 시도",
    hashtags: ["#꾸안못", "#검정코디", "#옷장", "#남자코디", "#무드핏"],
    cards: [
      { fmt: "F1", cover: true, lead: "옷장을 열면\n검정 티 여섯 벌" },
      { fmt: "F1", lead: "다 다른 날 산 건데\n다 똑같이 생겼다" },
      { fmt: "F1", lead: "안전해서 샀는데\n안전해서 아무 느낌도 없다" },
      { fmt: "F1", accentWord: true, eyebrow: "이게 꾸안못이야",
        lead: "실패는 안 하는데\n되지도 않는 상태." },
      { fmt: "F1", save: true, eyebrow: "네 탓이 아니야",
        lead: "검정만 산 게 아니라\n검정 말고 뭘 붙일지\n배운 적이 없을 뿐.",
        sub: "저장해두면 붙이는 그림째로 남아." },
    ] },

  // ── W4 ────────────────────────────────────────────────────────────
  { id: "W4-1", week: 4, type: "E", day: "월", weekTitle: "첫 제품 테스트",
    hashtags: ["#꾸안못", "#장바구니", "#남자코디", "#데일리룩", "#무드핏"],
    cards: [
      { fmt: "F1", cover: true, lead: "장바구니엔 12개\n아침엔 입을 게 없다" },
      { fmt: "F1", lead: "담을 땐\n다 좋아 보였는데" },
      { fmt: "F1", lead: "아침에 보면 다 안 어울릴 것 같아서\n결국 그 회색 맨투맨" },
      { fmt: "F1", accentWord: true, eyebrow: "이게 꾸안못이야",
        lead: "고르는 눈은 있는데\n꺼내 입을 확신이 없는 거." },
      { fmt: "F1", save: true, eyebrow: "네 탓이 아니야",
        lead: "확신이 없는 건 감각 탓이 아니라\n담기만 하고 조합을 본 적이 없어서야.",
        sub: "저장은 담기랑 달라. 입은 그림째로 남겨둬." },
    ] },

  // 그리드→단일 F2 전환: soft-010(여름 반팔)·003(맥코트)이 "겨울·플리스" 공통점과 안 맞아
  // 이미지-카피 불일치. 검증된 flagship soft-002 단독으로 이미지와 카피를 1:1 일치시킴.
  { id: "W4-2", week: 4, type: "S", day: "수", weekTitle: "첫 제품 테스트", axis: "소프트",
    hashtags: ["#소프트룩", "#크림코디", "#니트코디", "#남자코디", "#무드핏"],
    cards: [
      { fmt: "F2", cover: true, img: "soft-002.jpg", pos: "center 16%", axis: "소프트" },
      { fmt: "F2", img: "soft-002.jpg", pos: "center 44%", save: true, eyebrow: "봤어?",
        caption: "크림 블루종에 니트티.\n색은 안 늘리고 보들한 소재로만 인상을 풀었어.",
        subcaption: "딱딱해 보이던 인상이 소재 하나로 부드럽게 — 팔로무드러들이 소재부터 보는 이유야." },
    ] },

  { id: "W4-3", week: 4, type: "H", day: "금", weekTitle: "첫 제품 테스트",
    hashtags: ["#여름코디", "#휴가룩", "#남자코디", "#데이트룩", "#무드핏"],
    cards: [
      { fmt: "F7", cover: true, eyebrow: "D-3", lead: "휴가는 3일 남았고\n입을 건 아직 없다" },
      { fmt: "F7", img: "clean-001.jpg", pos: "center 22%",
        name: "여름 화이트", desc: "색 안 늘리고 정돈", total: LOOK_TOTAL["clean-001"], alt: "데이트는 이거면 안전" },
      { fmt: "F7", img: "amekaji-014.jpg", pos: "center 30%",
        name: "헨리넥 워크팬츠", desc: "여름에도 낡은 무드", total: LOOK_TOTAL["amekaji-014"], alt: "동네·페스티벌은 이거" },
      { fmt: "F7", img: "street-011.jpg", pos: "center 26%",
        name: "무지 오버핏", desc: "프린트 없이 크게", total: LOOK_TOTAL["street-011"], alt: "약속·나들이는 이거" },
      { fmt: "F7", save: true, cta: true,
        lead: "지금 안 고르면\n또 그 회색 맨투맨이야.",
        sub: "이런 룩 30개 넣어놨어. 앱에서 '무드핏' 검색." },
    ] },
];

// ─────────────────────────────────────────────────────────────────────
// 렌더러
// ─────────────────────────────────────────────────────────────────────
const esc = (s) => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const nl = (s) => esc(s).replace(/\n/g, "<br>");

function anchor(post, n, total, extraRight, onPhoto) {
  const dots = Array.from({ length: total }, (_, i) => `<span class="dot${i === n ? " on" : ""}"></span>`).join("");
  const right = extraRight ?? "";
  const scrim = onPhoto ? `<div class="topscrim"></div>` : "";
  return {
    brand: `${scrim}<div class="brand"><span class="wm">MOODFIT</span>${right}</div>`,
    foot: `<div class="foot"><div class="dots">${dots}</div></div>`,
  };
}
const savePill = `<div class="save"><span class="hh">♥</span> 저장</div>`;

function renderCard(post, card, n, total) {
  const axisR = card.axis ? `<span class="ax">${esc(card.axis)}</span>` : (post.axis && card.fmt !== "F7" ? "" : "");
  // 사진이 최상단까지 차는 카드 = 로고 뒤 스크림 필요 (F2 캡션형·F3·F7 룩형)
  const onPhoto = (card.fmt === "F2" && !card.cover) || card.fmt === "F3" || (card.fmt === "F7" && card.img);
  const { brand, foot } = anchor(post, n, total, axisR, onPhoto);
  const typeClass = `t-${post.type}`;
  let body = "";

  if (card.fmt === "F1") {
    const eyebrow = card.eyebrow ? `<p class="eyebrow${card.accentWord ? " accent" : ""}">${esc(card.eyebrow)}</p>` : "";
    const sub = card.sub ? `<p class="sub">${nl(card.sub)}</p>` : "";
    body = `${brand}
      <div class="body f1 ${card.cover ? "cover" : ""}">
        ${eyebrow}
        <p class="lead">${nl(card.lead)}</p>
        ${sub}
        ${card.save ? savePill : ""}
      </div>${foot}`;
  } else if (card.fmt === "F2") {
    if (card.cover) {
      body = `${brand}
        <div class="body f2 cover" style="--img:url('${IMG(card.img)}');--pos:${card.pos}">
          <div class="ph"></div>
          ${card.axis ? `<span class="cover-ax">${esc(card.axis)}</span>` : ""}
        </div>${foot}`;
    } else {
      const eyebrow = card.eyebrow ? `<p class="eyebrow">${esc(card.eyebrow)}</p>` : "";
      const subcap = card.subcaption ? `<p class="subcap">${nl(card.subcaption)}</p>` : "";
      body = `${brand}
        <div class="body f2">
          <div class="ph" style="background-image:url('${IMG(card.img)}');background-position:${card.pos}"></div>
          <div class="cap">${eyebrow}<p class="caption">${nl(card.caption)}</p>${subcap}${card.save ? savePill : ""}</div>
        </div>${foot}`;
    }
  } else if (card.fmt === "F3") {
    const marks = (card.markers || []).map((m) =>
      `<span class="mk" style="left:${m.x}%;top:${m.y}%"><span class="mk-dot"></span><span class="mk-lb">${esc(m.label)}</span></span>`).join("");
    body = `${brand}
      <div class="body f3">
        <div class="ph" style="background-image:url('${IMG(card.img)}');background-position:${card.pos}">${marks}</div>
        <div class="cap"><p class="note">${nl(card.note)}</p></div>
      </div>${foot}`;
  } else if (card.fmt === "F4") {
    const title = `<div class="chat-top"><span class="chat-back">‹</span><span class="chat-name">${esc(card.title || "")}</span></div>`;
    const bubbles = card.bubbles.map((b) => `<div class="row ${b.s}"><div class="bub">${nl(b.t)}</div></div>`).join("");
    body = `${brand}
      <div class="body f4">
        <div class="phone">${title}<div class="thread">${bubbles}</div></div>
        ${card.save ? savePill : ""}
      </div>${foot}`;
  } else if (card.fmt === "F6") {
    const cells = card.imgs.map((f) => `<div class="cell" style="background-image:url('${IMG(f)}')"></div>`).join("");
    body = `${brand}
      <div class="body f6">
        <div class="grid">${cells}</div>
        <p class="common">${nl(card.common)}</p>
      </div>${foot}`;
  } else if (card.fmt === "F7") {
    if (card.cover) {
      body = `${brand}
        <div class="body f7 cover">
          <p class="eyebrow">${esc(card.eyebrow)}</p>
          <p class="lead">${nl(card.lead)}</p>
        </div>${foot}`;
    } else if (card.cta) {
      body = `${brand}
        <div class="body f7 cta">
          <p class="lead">${nl(card.lead)}</p>
          <p class="sub">${nl(card.sub)}</p>
          ${savePill}
        </div>${foot}`;
    } else {
      body = `${brand}
        <div class="body f7 look">
          <div class="ph" style="background-image:url('${IMG(card.img)}');background-position:${card.pos}"></div>
          <div class="meta">
            <p class="lk-name">${esc(card.name)} <span>· ${esc(card.desc)}</span></p>
            <div class="lk-total">이 느낌 완성 · <b>${esc(card.total)}</b></div>
            <p class="lk-alt">${esc(card.alt)}</p>
          </div>
        </div>${foot}`;
    }
  }
  return `<div class="card ${typeClass}" data-id="${post.id}-${n + 1}">${body}</div>`;
}

// ─────────────────────────────────────────────────────────────────────
// 스타일
// ─────────────────────────────────────────────────────────────────────
const STYLE = `
:root{--paper:#FAFAF8;--paper2:#F2F1EE;--ink:#1A1A1A;--ink-soft:#8A8A86;--ink-faint:#B0AFA9;--line:#E7E5DF;
  --warm:#B4785E;--mustard:#C0902A;--black:#141414;}
*{box-sizing:border-box;margin:0;padding:0;-webkit-font-smoothing:antialiased}
body{background:var(--paper2)}
.card{width:1080px;height:1350px;position:relative;overflow:hidden;background:var(--paper);color:var(--ink);
  font-family:'Pretendard','Wanted Sans Variable',-apple-system,'Apple SD Gothic Neo',system-ui,sans-serif;display:flex}
.brand{position:absolute;top:60px;left:72px;right:72px;display:flex;align-items:center;justify-content:space-between;z-index:5}
.wm{font-family:'Space Grotesk','Pretendard',sans-serif;font-weight:600;letter-spacing:.18em;font-size:25px}
.ax,.cover-ax{font-size:24px;color:var(--ink-soft)}
.topscrim + .brand .wm{color:#fff}.topscrim + .brand .ax{color:rgba(255,255,255,.82)}
.topscrim{position:absolute;top:0;left:0;right:0;height:190px;z-index:4;
  background:linear-gradient(180deg,rgba(0,0,0,.34),rgba(0,0,0,0))}
.foot{position:absolute;bottom:56px;left:0;right:0;display:flex;justify-content:center;z-index:5}
.dots{display:flex;gap:13px}.dot{width:11px;height:11px;border-radius:50%;background:var(--line)}.dot.on{background:var(--ink)}
.body{flex:1;display:flex;flex-direction:column;width:100%}
.save{position:absolute;left:72px;bottom:120px;display:inline-flex;align-items:center;gap:12px;
  border:2px solid var(--ink);border-radius:999px;padding:16px 38px;font-size:32px;font-weight:600;background:var(--paper)}
.save .hh{font-size:30px}

/* F1 텍스트 */
.f1{justify-content:center;padding:0 104px}
.f1.cover{justify-content:center}
.eyebrow{font-size:32px;color:var(--ink-soft);font-weight:500;margin-bottom:30px;letter-spacing:-.01em}
.eyebrow.accent{color:var(--warm)}
.f1 .lead{font-size:64px;line-height:1.42;font-weight:700;letter-spacing:-.02em;word-break:keep-all}
.f1.cover .lead{font-size:76px;line-height:1.34}
.f1 .sub{margin-top:40px;font-size:34px;line-height:1.5;color:var(--ink-soft);font-weight:500;word-break:keep-all}
.f1 .save{position:static;margin-top:56px;align-self:flex-start}

/* 유형 액센트: I=머스터드 강조 단어 */
.t-I .eyebrow.accent{color:var(--mustard)}

/* F2 사진 */
.f2{position:relative}
.f2.cover{--img:none}
.f2.cover .ph{position:absolute;inset:0;background-image:var(--img);background-size:cover;background-position:var(--pos)}
.f2.cover .cover-ax{position:absolute;left:72px;bottom:64px;color:#fff;font-size:30px;z-index:4;
  text-shadow:0 2px 18px rgba(0,0,0,.5)}
.f2 .ph{flex:1;background-size:cover;background-repeat:no-repeat;background-color:var(--paper2)}
.f2 .cap{background:var(--paper);padding:50px 80px 108px}
.f2 .caption{font-size:50px;line-height:1.4;font-weight:600;letter-spacing:-.015em;word-break:keep-all}
.f2 .subcap{margin-top:22px;font-size:30px;color:var(--ink-soft);word-break:keep-all}
.f2 .cap .save{position:static;margin-top:34px}

/* F3 주석 */
.f3{position:relative}
.f3 .ph{flex:1;position:relative;background-size:cover;background-color:var(--paper2)}
.f3 .mk{position:absolute;transform:translate(-50%,-50%);display:flex;align-items:center;gap:16px}
.f3 .mk-dot{width:34px;height:34px;border-radius:50%;border:4px solid var(--mustard);
  box-shadow:0 0 0 8px rgba(192,144,42,.25);background:rgba(192,144,42,.18)}
.f3 .mk-lb{background:var(--mustard);color:#fff;font-size:28px;font-weight:600;padding:8px 20px;border-radius:999px}
.f3 .cap{background:var(--paper);padding:50px 80px 108px}
.f3 .note{font-size:48px;line-height:1.42;font-weight:600;word-break:keep-all}

/* F4 채팅 */
.f4{align-items:center;justify-content:center;background:var(--paper2)}
.phone{width:840px;background:#fff;border-radius:44px;overflow:hidden;box-shadow:0 24px 70px rgba(0,0,0,.12);
  margin-top:40px;padding-bottom:52px}
.chat-top{display:flex;align-items:center;gap:14px;padding:40px 44px 30px;border-bottom:1px solid var(--line)}
.chat-back{font-size:44px;color:var(--ink-faint);line-height:1}
.chat-name{font-size:34px;font-weight:600}
.thread{padding:44px 44px 8px;display:flex;flex-direction:column;gap:26px}
.row{display:flex}.row.me{justify-content:flex-end}.row.them{justify-content:flex-start}
.bub{max-width:74%;font-size:40px;line-height:1.35;padding:26px 34px;border-radius:30px;word-break:keep-all}
.row.them .bub{background:#EDEBE6;color:var(--ink);border-bottom-left-radius:10px}
.row.me .bub{background:#1A1A1A;color:#fff;border-bottom-right-radius:10px}
.f4 .save{position:absolute;bottom:120px}

/* F6 그리드 */
.f6{padding-top:132px}
.grid{flex:1;display:grid;grid-template-columns:1fr 1fr;grid-template-rows:1fr 1fr;gap:8px;padding:0 8px}
.cell{background-size:cover;background-position:center 20%;background-color:var(--paper2)}
.common{padding:44px 80px 116px;font-size:46px;line-height:1.4;font-weight:700;letter-spacing:-.02em;word-break:keep-all}

/* F7 블랙 반전 (H) */
.t-H .card,.f7{--paper:var(--black)}
.card.t-H{background:var(--black);color:#F4F2ED}
.card.t-H .wm{color:#F4F2ED}.card.t-H .dot{background:#3a3a37}.card.t-H .dot.on{background:#F4F2ED}
.f7{color:#F4F2ED}
.f7.cover{justify-content:center;padding:0 100px}
.f7.cover .eyebrow{color:#E0A94E;font-family:'Space Grotesk',sans-serif;letter-spacing:.14em;font-size:38px;font-weight:600;margin-bottom:34px}
.f7.cover .lead{font-size:74px;line-height:1.34;font-weight:700;letter-spacing:-.02em;word-break:keep-all}
.f7.look{position:relative}
.f7.look .ph{flex:1;background-size:cover;background-color:#222}
.f7.look .meta{padding:46px 80px 112px}
.lk-name{font-size:46px;font-weight:700;letter-spacing:-.02em}.lk-name span{color:#a9a7a1;font-weight:500;font-size:36px}
.lk-total{margin-top:22px;font-size:34px;color:#cfcdc7}.lk-total b{color:#E0A94E;font-family:'Space Grotesk',sans-serif;font-weight:600}
.lk-alt{margin-top:16px;font-size:34px;color:#F4F2ED}
.f7.cta{justify-content:center;padding:0 100px}
.f7.cta .lead{font-size:64px;line-height:1.38;font-weight:700;letter-spacing:-.02em;word-break:keep-all}
.f7.cta .sub{margin-top:36px;font-size:36px;line-height:1.5;color:#cfcdc7;word-break:keep-all}
.card.t-H .save{border-color:#F4F2ED;color:#F4F2ED;background:transparent;position:static;margin-top:52px;align-self:flex-start}
`;

function pageHtml(cardMarkup, title, isDark) {
  return `<!doctype html><html lang="ko"><head><meta charset="utf-8"><title>${esc(title)}</title>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&display=swap">
<style>${STYLE}
html,body{width:1080px;height:1350px;background:${isDark ? "#141414" : "#FAFAF8"}}</style></head>
<body>${cardMarkup}</body></html>`;
}

// ─────────────────────────────────────────────────────────────────────
// 빌드
// ─────────────────────────────────────────────────────────────────────
const manifest = [];
const galleryPosts = [];

for (const post of POSTS) {
  const total = post.cards.length;
  const cardMarkups = post.cards.map((c, i) => renderCard(post, c, i, total));
  const isDark = post.type === "H";
  cardMarkups.forEach((mk, i) => {
    const fname = `${post.id}-${i + 1}.html`;
    writeFileSync(join(__dirname, "render", fname), pageHtml(mk, `${post.id} ${i + 1}`, isDark));
    manifest.push({ post: post.id, n: i + 1, render: `render/${fname}`, out: `out/${post.id}/${i + 1}.png`, dark: isDark });
  });
  galleryPosts.push({ post, cardMarkups });
}

// index.html (주차별 리뷰 갤러리)
const TYPE_LABEL = { E: "공감", S: "감각", I: "정보", H: "훅/홍보" };
const weeks = [1, 2, 3, 4];
const gallery = weeks.map((w) => {
  const ps = galleryPosts.filter((g) => g.post.week === w);
  const title = ps[0].post.weekTitle;
  const rows = ps.map(({ post, cardMarkups }) => `
    <div class="post">
      <div class="phead"><span class="pt pt-${post.type}">${post.type} · ${TYPE_LABEL[post.type]}</span>
        <span class="pid">${post.id} · ${post.day}요일 · ${post.cards.length}장</span>
        <span class="ph-tags">${post.hashtags.join(" ")}</span></div>
      <div class="strip">${cardMarkups.map((m) => `<div class="tile ${post.type === "H" ? "dark" : ""}">${m}</div>`).join("")}</div>
    </div>`).join("");
  return `<section class="wk"><h2>W${w} · ${esc(title)}</h2>${rows}</section>`;
}).join("");

const indexHtml = `<!doctype html><html lang="ko"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1"><title>무드핏 카드뉴스 v3 — 초기 4주 런칭(12편)</title>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&display=swap">
<style>${STYLE}
body{background:#E9E7E2;font-family:'Pretendard',sans-serif;color:#1A1A1A;padding:44px 30px 120px}
.head{max-width:1240px;margin:0 auto 30px}.head h1{font-size:32px;font-weight:700}
.head p{color:#6b6b66;margin-top:10px;font-size:15px;line-height:1.6}
.wk{max-width:1240px;margin:0 auto 56px}.wk h2{font-family:'Space Grotesk',sans-serif;font-size:22px;margin-bottom:20px;
  border-bottom:2px solid #d6d3cc;padding-bottom:10px}
.post{margin-bottom:34px}
.phead{display:flex;align-items:center;gap:14px;flex-wrap:wrap;margin-bottom:12px}
.pt{font-size:14px;font-weight:700;color:#fff;padding:3px 12px;border-radius:6px}
.pt-E{background:#B4785E}.pt-S{background:#5a5a55}.pt-I{background:#C0902A}.pt-H{background:#1A1A1A}
.pid{font-size:14px;color:#6b6b66}.ph-tags{font-size:13px;color:#9a988f}
.strip{display:flex;gap:18px;overflow-x:auto;padding-bottom:12px}
.tile{flex:0 0 auto;width:288px;height:360px;border-radius:12px;overflow:hidden;box-shadow:0 6px 22px rgba(0,0,0,.10);background:#FAFAF8}
.tile.dark{background:#141414}
.tile .card{transform:scale(.26666);transform-origin:top left}
</style></head><body>
<div class="head"><h1>무드핏 카드뉴스 v3 · 초기 4주 런칭 시퀀스</h1>
<p>4유형(E 공감·S 감각·I 정보·H 훅/홍보) × 포맷 로테이션(F1~F7). 12편 · 총 ${manifest.length}장.
PNG 내보내기: <code>bash export.sh</code> → <code>out/</code>. 게시계획·자가검수: <code>plan.md</code>.</p></div>
${gallery}</body></html>`;
writeFileSync(join(__dirname, "index.html"), indexHtml);
writeFileSync(join(__dirname, "manifest.json"), JSON.stringify(manifest, null, 2));

// ── 게시계획 + 자가검수 체크리스트 (§4.3~4.4) ──────────────────────────
const BANNED = ["정답", "트렌드", "베스트", "인기", "핫한", "특가", "저렴이", "가성비", "옷맹", "요즘"];
function allCopy(post) {
  return post.cards.flatMap((c) => [c.lead, c.sub, c.caption, c.subcaption, c.common, c.note, c.eyebrow,
    c.name, c.desc, c.alt, ...(c.bubbles || []).map((b) => b.t)]).filter(Boolean).join(" ");
}
let plan = `# 무드핏 카드뉴스 v3 — 게시계획 & 자가검수\n\n`;
plan += `초기 4주 런칭 시퀀스(§5). 배합 E5·S5·I1·H1 = 12편(팔로워 대기 우선).\n\n`;
// 공유어 카운트
const shareWords = ["꾸안못", "팔로무드러"];
plan += `## 자가검수 요약 (§4.3)\n\n| 편 | 유형 | 포맷 | 장 | 금지어 | 정보문장 | 공유어 | 요일 |\n|---|---|---|---|---|---|---|---|\n`;
for (const post of POSTS) {
  const copy = allCopy(post);
  const hitBanned = BANNED.filter((w) => copy.includes(w));
  const infoCount = post.type === "I" ? 1 : 0; // I만 정보 1문장(설계상)
  const share = shareWords.filter((w) => copy.includes(w));
  const fmts = [...new Set(post.cards.map((c) => c.fmt))].join("→");
  plan += `| ${post.id} | ${post.type} | ${fmts} | ${post.cards.length} | ${hitBanned.length ? "⚠️ " + hitBanned.join(",") : "✅ 0"} | ${post.type === "I" ? "1(설계)" : "0"} | ${share.join(",") || "-"} | ${post.day} |\n`;
}
// 주별 공유어 합산 체크
plan += `\n### 주별 공유어 합산 (§0-4, 목표 ≥2)\n`;
for (const w of weeks) {
  const copy = POSTS.filter((p) => p.week === w).map(allCopy).join(" ");
  const cnt = shareWords.reduce((s, word) => s + (copy.split(word).length - 1), 0);
  plan += `- W${w}: ${cnt}회 ${cnt >= 2 ? "✅" : "⚠️"}\n`;
}
plan += `\n## 게시물별 상세 (§4.4)\n\n`;
for (const post of POSTS) {
  plan += `### ${post.id} — ${post.type}(${TYPE_LABEL[post.type]}) · ${post.day}요일 · W${post.week} ${post.weekTitle}\n`;
  plan += `- 포맷 시퀀스: ${post.cards.map((c) => c.fmt).join(" → ")}\n`;
  plan += `- 이미지: ${[...new Set(post.cards.flatMap((c) => c.img ? [c.img] : c.imgs || []))].join(", ") || "무이미지(텍스트/채팅)"}\n`;
  plan += `- 해시태그: ${post.hashtags.join(" ")}\n`;
  plan += `- 장별 카피:\n`;
  post.cards.forEach((c, i) => {
    const t = c.lead || c.caption || c.common || c.note || (c.bubbles ? c.bubbles.map((b) => `${b.s === "me" ? "나" : "친구"}: ${b.t}`).join(" / ") : c.name ? `${c.name} · ${c.desc} · 완성 ${c.total}` : c.eyebrow || "(사진 단독)");
    plan += `  ${i + 1}. [${c.fmt}] ${String(t).replace(/\n/g, " ")}\n`;
  });
  plan += `\n`;
}
writeFileSync(join(__dirname, "plan.md"), plan);

console.log(`v3 빌드 완료: ${POSTS.length}편 · ${manifest.length}장`);
console.log(`- 리뷰: cardnews/index.html`);
console.log(`- 계획/검수: cardnews/plan.md`);
console.log(`- PNG: bash cardnews/export.sh`);
