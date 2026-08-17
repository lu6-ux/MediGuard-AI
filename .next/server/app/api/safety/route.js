"use strict";(()=>{var e={};e.id=429,e.ids=[429],e.modules={517:e=>{e.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},1325:(e,t,i)=>{i.r(t),i.d(t,{headerHooks:()=>h,originalPathname:()=>y,patchFetch:()=>v,requestAsyncStorage:()=>f,routeModule:()=>u,serverHooks:()=>p,staticGenerationAsyncStorage:()=>m,staticGenerationBailout:()=>g});var r={};i.r(r),i.d(r,{POST:()=>l,maxDuration:()=>d});var a=i(5419),o=i(9108),s=i(9678),n=i(8070),c=i(973);let d=30;async function l(e){try{let{medications:t,allergies:i,apiKey:r}=await e.json();if(!t||!r)return n.Z.json({error:"Missing required parameters: medications or apiKey"},{status:400});let a=new c.$D(r).getGenerativeModel({model:"gemini-1.5-flash"}),o=`
You are a highly experienced clinical pharmacist AI. 
Analyze the following patient profile containing known allergies and a comprehensive list of medications extracted from one or more medical visits.
Perform a deep cross-check for the following safety concerns:
1. "allergy_contradiction": Check if any medication contradicts the patient's known allergies.
2. "drug_interaction": Check for severe drug-drug interactions between any of the medications.
3. "duplicate_prescription": Check if the same drug (or drug class) was prescribed multiple times.
4. "dosage_conflict": Check if there are conflicting dosage instructions for the same medication across different visits.

Here is the data:
Allergies: ${JSON.stringify(i)}
Medications (with their source visit dates and IDs):
${JSON.stringify(t)}

Output a valid JSON object matching exactly this structure:
{
  "alerts": [
    {
      "id": "unique-id-string",
      "type": "allergy_contradiction" | "drug_interaction" | "duplicate_prescription" | "dosage_conflict" | "missing_info",
      "severity": "high" | "warning" | "info",
      "title": "Short title",
      "description": "Detailed explanation of the risk",
      "evidence": ["Quote from the medication list supporting this alert"],
      "recommendation": "Actionable advice for the patient/doctor",
      "affectedMedications": ["Name of drug 1", "Name of drug 2"],
      "docIds": ["docId-of-affected-med-1", "docId-of-affected-med-2"],
      "visitDates": ["visit-date-1", "visit-date-2"]
    }
  ],
  "riskScore": {
    "score": number, // 0 (critical risk) to 100 (perfect safety)
    "riskLevel": "Safe" | "Moderate" | "High Risk",
    "totalAlerts": number,
    "highRiskCount": number,
    "warningCount": number,
    "infoCount": number,
    "summary": "Overall summary of the safety profile",
    "totalMedicationsAnalyzed": ${t.length},
    "safetyChecksPerformed": 4
  }
}

Do NOT output markdown \`\`\`json blocks. Just output the raw JSON object. If there are no alerts, return an empty alerts array [] and score 100.
`,s=(await a.generateContent(o)).response.text().trim();s.startsWith("```json")?s=s.slice(7,-3).trim():s.startsWith("```")&&(s=s.slice(3,-3).trim());let d=JSON.parse(s);return n.Z.json({data:d})}catch(e){return console.error("Gemini Safety Analysis Error:",e),n.Z.json({error:e.message||"Failed to analyze safety using Gemini API."},{status:500})}}let u=new a.AppRouteRouteModule({definition:{kind:o.x.APP_ROUTE,page:"/api/safety/route",pathname:"/api/safety",filename:"route",bundlePath:"app/api/safety/route"},resolvedPagePath:"C:\\Users\\PC\\.gemini\\antigravity\\scratch\\mediguard-ai\\src\\app\\api\\safety\\route.ts",nextConfigOutput:"",userland:r}),{requestAsyncStorage:f,staticGenerationAsyncStorage:m,serverHooks:p,headerHooks:h,staticGenerationBailout:g}=u,y="/api/safety/route";function v(){return(0,s.patchFetch)({serverHooks:p,staticGenerationAsyncStorage:m})}}};var t=require("../../../webpack-runtime.js");t.C(e);var i=e=>t(t.s=e),r=t.X(0,[638,206,973],()=>i(1325));module.exports=r})();