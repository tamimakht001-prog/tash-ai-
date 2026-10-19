exports.handler = async (event) => {
 if (event.httpMethod !== "POST") return out(405,{error:"Use POST."});
 const key=process.env.GEMINI_API_KEY;
 if(!key) return out(500,{error:"Netlify-তে GEMINI_API_KEY সেট করা নেই।"});
 try {
  const message=String(JSON.parse(event.body||"{}").message||"").trim();
  if(!message)return out(400,{error:"কিছু লিখে পাঠাও।"});
  const url="https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key="+encodeURIComponent(key);
  const r=await fetch(url,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({contents:[{parts:[{text:message}]}]})});
  const d=await r.json();
  if(!r.ok)return out(r.status,{error:d.error?.message||"Gemini API request failed."});
  return out(200,{reply:d.candidates?.[0]?.content?.parts?.map(x=>x.text||"").join("")||"কোনো উত্তর পাওয়া যায়নি।"});
 }catch(e){return out(500,{error:"Server error. আবার চেষ্টা করো।"});}
};
function out(statusCode,body){return {statusCode,headers:{"Content-Type":"application/json"},body:JSON.stringify(body)};}
