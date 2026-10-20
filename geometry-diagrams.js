/* Geometry Auto Diagram Engine
 * Deterministic SVG templates for text-described geometry questions.
 * Drawings are schematic unless all required constraints can be solved.
 * Existing source images are intentionally preserved by the caller.
 */
(function (global) {
  "use strict";

  const NS = "http://www.w3.org/2000/svg";
  const clean = (s) => String(s || "").replace(/<br\s*\/?>/gi, " ").replace(/<[^>]*>/g, " ").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/\s+/g, " ").trim();
  const esc = (s) => String(s).replace(/[&<>"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
  const svgStart = (title) => '<svg xmlns="' + NS + '" viewBox="0 0 420 260" role="img" aria-label="' + esc(title) + '" style="display:block;width:100%;max-width:480px;height:auto;margin:auto;background:#fff;border-radius:10px">';
  const line = (x1,y1,x2,y2,extra) => '<line x1="'+x1+'" y1="'+y1+'" x2="'+x2+'" y2="'+y2+'" stroke="#26364a" stroke-width="2.2" stroke-linecap="round" '+(extra||"")+'/>';
  const dot = (x,y,label,dx,dy) => '<circle cx="'+x+'" cy="'+y+'" r="3" fill="#26364a"/><text x="'+(x+(dx||0))+'" y="'+(y+(dy||0))+'" font-size="14" font-weight="700" fill="#182536">'+esc(label)+'</text>';
  const text = (x,y,value,anchor) => '<text x="'+x+'" y="'+y+'" text-anchor="'+(anchor||"middle")+'" font-size="14" fill="#182536">'+esc(value)+'</text>';
  const arc = (cx,cy,r,startDeg,endDeg,label) => {
    const p = a => ({x:cx+r*Math.cos(a*Math.PI/180),y:cy+r*Math.sin(a*Math.PI/180)});
    const a=p(startDeg), b=p(endDeg), large=Math.abs(endDeg-startDeg)>180?1:0;
    const mid=p((startDeg+endDeg)/2);
    return '<path d="M '+a.x+' '+a.y+' A '+r+' '+r+' 0 '+large+' 1 '+b.x+' '+b.y+'" fill="none" stroke="#0f766e" stroke-width="1.7"/>'+text(mid.x,mid.y-7,label);
  };
  function anglesFrom(s) {
    const out = {};
    const re = /(?:∠|angle\s*)([A-Z])\s*(?:=|is|of)?\s*(\d+(?:\.\d+)?)\s*°/gi;
    let m;
    while ((m = re.exec(s))) out[m[1].toUpperCase()] = Number(m[2]);
    const compact = /m\s*∠\s*([A-Z]{3})\s*=\s*(\d+(?:\.\d+)?)\s*°/gi;
    while ((m = compact.exec(s))) out[m[1].charAt(1).toUpperCase()] = Number(m[2]);
    return out;
  }
  function triangleSvg(s, title) {
    const equal = /AB\s*=\s*AC|AC\s*=\s*AB|AB\s*≅\s*AC|समद्विबाहु/i.test(s);
    const angles = anglesFrom(s);
    let A=angles.A, B=angles.B, C=angles.C;
    if (equal && Number.isFinite(A) && !Number.isFinite(B) && !Number.isFinite(C)) B=C=(180-A)/2;
    if (Number.isFinite(A) && Number.isFinite(B) && !Number.isFinite(C)) C=180-A-B;
    if (Number.isFinite(A) && Number.isFinite(C) && !Number.isFinite(B)) B=180-A-C;
    if (Number.isFinite(B) && Number.isFinite(C) && !Number.isFinite(A)) A=180-B-C;
    const solved = [A,B,C].every(Number.isFinite) && [A,B,C].every(v=>v>0&&v<180) && Math.abs(A+B+C-180)<0.02;
    if (!solved) { A=55; B=65; C=60; }
    const baseY=214, leftX=76, rightX=344, base=rightX-leftX;
    const tanA=Math.tan(A*Math.PI/360);
    const h=Number.isFinite(tanA)&&tanA>0 ? Math.min(155,base/(2*tanA)) : 125;
    const apexX=leftX+base/2, apexY=baseY-h;
    const side1=Math.atan2(baseY-apexY,leftX-apexX)*180/Math.PI;
    const side2=Math.atan2(baseY-apexY,rightX-apexX)*180/Math.PI;
    let out=svgStart(title);
    out+=line(leftX,baseY,rightX,baseY)+line(leftX,baseY,apexX,apexY)+line(apexX,apexY,rightX,baseY);
    out+=dot(apexX,apexY,"A",0,-10)+dot(leftX,baseY,"B",-16,18)+dot(rightX,baseY,"C",10,18);
    out+=arc(apexX,apexY,27,side1,side2,Math.round(A*100)/100+"°");
    out+=arc(leftX,baseY,28,-A/2,0,Math.round(B*100)/100+"°");
    out+=arc(rightX,baseY,28,180,180-(180-C),Math.round(C*100)/100+"°");
    if (equal) {
      out+='<path d="M 143 143 l 8 7 M 269 150 l 8 -7" stroke="#b45309" stroke-width="2.5" fill="none"/>';
    }
    if (!solved) out+=text(210,245,"सांकेतिक आकृति (मापानुसार नहीं)");
    else if (Math.abs(A+B+C-180)<0.02) out+=text(210,245,"कोणों का योग = 180°");
    return out+'</svg>';
  }
  function circleSvg(s, title) {
    const hasTwo = /दो\s*संकेंद्री|concentric|दो\s*वृत्त/i.test(s);
    const secant = /secant|छेदक/i.test(s);
    const tangent = /tangent|स्पर्श\s*रेखा|स्पर्शरेखा/i.test(s);
    let out=svgStart(title);
    const cx=hasTwo?150:180, cy=130, r=hasTwo?72:78;
    out+='<circle cx="'+cx+'" cy="'+cy+'" r="'+r+'" fill="none" stroke="#26364a" stroke-width="2.2"/>';
    if(hasTwo) out+='<circle cx="'+cx+'" cy="'+cy+'" r="48" fill="none" stroke="#64748b" stroke-width="2"/>';
    out+=dot(cx,cy,/center\s*P|केंद्र\s*P/i.test(s)?"P":"O",-15,18);
    if(tangent){
      const px=350, py=130, vx=px-cx, vy=py-cy, d2=vx*vx+vy*vy, rr=r*r;
      const k=rr/d2, h=r*Math.sqrt(Math.max(0,d2-rr))/d2;
      const q1={x:cx+k*vx-h*vy,y:cy+k*vy+h*vx}, q2={x:cx+k*vx+h*vy,y:cy+k*vy-h*vx};
      out+=line(px,py,q1.x,q1.y)+line(px,py,q2.x,q2.y);
      out+=line(cx,cy,q1.x,q1.y,'stroke="#0f766e" stroke-width="1.5" stroke-dasharray="4 4"');
      out+=dot(px,py,"P",7,-6)+dot(q1.x,q1.y,"A",-15,-7)+dot(q2.x,q2.y,"B",-15,17);
      out+=text(300,24,"स्पर्श रेखा");
    } else if(secant) {
      out+=line(65,185,360,75,'stroke="#0f766e"');
      out+=dot(65,185,"P",-12,17)+dot(116,166,"C",-14,-8)+dot(249,117,"D",7,-8);
    } else {
      out+=line(cx,cy,cx+r,cy,'stroke="#0f766e" stroke-width="1.7"');
      out+=dot(cx+r,cy,"A",6,-6);
    }
    if(!tangent&&!secant) out+=text(210,245,"सांकेतिक वृत्त");
    return out+'</svg>';
  }
  function quadSvg(s, title) {
    const rectangle=/rectangle|आयत/i.test(s), parallel=/trapez|समलंब|parallel|\|\|/.test(s);
    let out=svgStart(title);
    if(rectangle){
      out+='<path d="M 78 48 L 342 48 L 342 210 L 78 210 Z" fill="none" stroke="#26364a" stroke-width="2.2"/>';
      out+=line(78,48,342,210,'stroke="#0f766e" stroke-dasharray="5 4"')+line(342,48,78,210,'stroke="#0f766e" stroke-dasharray="5 4"');
      out+=dot(78,48,"A",-16,-8)+dot(342,48,"B",8,-8)+dot(342,210,"C",8,17)+dot(78,210,"D",-16,17)+dot(210,129,"O",8,-8);
    } else {
      out+='<path d="M 75 205 L 125 55 L 315 55 L 360 205 Z" fill="none" stroke="#26364a" stroke-width="2.2"/>';
      out+=dot(75,205,"P",-15,17)+dot(125,55,"Q",-14,-8)+dot(315,55,"R",8,-8)+dot(360,205,"S",8,17);
      if(parallel) out+=text(210,239,"PQ ∥ RS");
    }
    if(!rectangle&&!parallel) out+=text(210,239,"सांकेतिक चतुर्भुज");
    return out+'</svg>';
  }
  function lineAngleSvg(title) {
    let out=svgStart(title);
    out+=line(55,205,365,55)+line(65,55,355,205,'stroke="#0f766e"');
    out+=dot(210,130,"O",7,-7)+text(245,112,"θ");
    return out+'</svg>';
  }
  function build(item, lang) {
    if (!item || typeof item !== "object") return null;
    const raw = (item["q_"+(lang||"hi")] || item.q_hi || item.q_en || item.q || "");
    const s = clean(raw+" "+(item.type_tag||""));
    if (!s) return null;
    const tag = String(item.type_tag||"");
    const isGeom = /geometry|triangle|triangles|circle|quadrilateral|line and angle|lines and angles|त्रिभुज|वृत्त|चतुर्भुज|रेखा|कोण|समलंब|आयत/i.test(s);
    if (!isGeom) return null;
    let svg, kind;
    if (/circle|circles|tangent|secant|वृत्त|स्पर्श\s*रेखा|स्पर्शरेखा|छेदक/i.test(s) || /circle/i.test(tag)) {
      kind="circle"; svg=circleSvg(s,"Geometry diagram: circle");
    } else if (/rectangle|quadrilateral|trapez|polygon|आयत|चतुर्भुज|समलंब|बहुभुज/i.test(s) || /quadrilateral|rectangle|trapez/i.test(tag)) {
      kind="quadrilateral"; svg=quadSvg(s,"Geometry diagram: quadrilateral");
    } else if (/line\s*(and|&)\s*angle|lines\s*(and|&)\s*angles|parallel\s*lines|रेखा.*कोण|समांतर रेखा/i.test(s) && !/triangle|त्रिभुज/i.test(s)) {
      kind="lines"; svg=lineAngleSvg("Geometry diagram: lines and angles");
    } else {
      kind="triangle"; svg=triangleSvg(s,"Geometry diagram: triangle");
    }
    return {svg,kind,verified: /triangle|त्रिभुज/i.test(s) && /\d+\s*°/.test(s), label:"Auto-generated schematic"};
  }
  function append(container,item,lang) {
    if (!container || !item || container.querySelector(".auto-geometry-diagram") || container.querySelector("img")) return;
    // Do not duplicate a supplied source figure: it may contain the exact exam diagram.
    const source = item.image || item.img;
    if (typeof source === "string" && source.trim()) return;
    const result=build(item,lang);
    if(!result) return;
    const wrap=document.createElement("figure");
    wrap.className="auto-geometry-diagram";
    wrap.style.cssText="margin:12px auto;padding:10px;border:1px solid #dbe4ee;border-radius:12px;background:#fff;max-width:500px;box-sizing:border-box;";
    wrap.innerHTML=result.svg+'<figcaption style="font:12px/1.4 system-ui,sans-serif;color:#64748b;text-align:center;margin-top:4px">स्वचालित सांकेतिक चित्र · प्रश्न के सभी मापों का पैमाना नहीं</figcaption>';
    container.appendChild(wrap);
  }
  global.GeometryDiagramEngine={build,append};
})(window);
