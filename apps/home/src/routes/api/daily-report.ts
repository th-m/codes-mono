import { Configuration, OpenAIApi } from 'openai';
import invariant from 'tiny-invariant';
import { supabase } from '~/models/users.server';
// handles HTTP GET requests to /api/students
const openAIKey = process.env.OPEN_AI_KEY;
const resuceTimeKey = process.env.RESCUE_TIME_KEY;
const wakatimeKey = process.env.WAKA_TIME_KEY;
import { APIEvent, json } from "solid-start/api";
invariant(openAIKey, 'openAIKey must be set in your environment variables.');
invariant(
  resuceTimeKey,
  'resuceTimeKey must be set in your environment variables.'
);
invariant(
  wakatimeKey,
  'wakatimeKey must be set in your environment variables.'
);


// const todaysDate = new Date();
// const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);  
const constructIntervalTime = (date:Date) => {
  return `${date.getFullYear()}-${date.getMonth()+1}-${date.getDate()}`
}

// const wakatimeReportURL = `https://wakatime.com/api/v1/users/current/stats/last_7_days?api_key=${wakatimeKey}`;
// const intervalStart = constructIntervalTime(todaysDate)
// const intervalEnd = constructIntervalTime(todaysDate)
// const rescueTimeReportURL = `https://www.rescuetime.com/anapi/data?key=${resuceTimeKey}&perspective=interval&restrict_kind=productivity&interval=hour&restrict_begin=${intervalStart}&restrict_end=${intervalEnd}&format=json`
// const wakatimeReportURL = `https://wakatime.com/api/v1/users/current/summaries?api_key=${wakatimeKey}&start=${intervalStart}&end=${intervalEnd}`

const getReportURLs= (dayOffset:number) => {
  const date = new Date(Date.now() - dayOffset * 24 * 60 * 60 * 1000);  
  const interval = constructIntervalTime(date)
  const rescueTimeInterval ='day'
  const rescueTimeReportURL = `https://www.rescuetime.com/anapi/data?key=${resuceTimeKey}&perspective=interval&restrict_kind=productivity&interval=${rescueTimeInterval}&restrict_begin=${interval}&restrict_end=${interval}&format=json`
  const wakatimeReportURL = `https://wakatime.com/api/v1/users/current/summaries?api_key=${wakatimeKey}&start=${interval}&end=${interval}`
  return {
    date,
    rescueTimeReportURL,
    wakatimeReportURL
  }

}
// https://wakatime.com/api/v1/users/current/stats/last_7_days?api_key=waka_fb8378c8-4829-42b5-b3c9-2988215542b2

interface RescueSummary {
  notes: string
  row_headers: ["Date",
  "Time Spent (seconds)",
  "Number of People",
  "Productivity"]
  rows: [string, number, number, number][]
}

const getRescueInserts = (data:RescueSummary,timestamp:string) => {
  return data.rows.map(row => ({ date: timestamp, time_spent_seconds: row[1], number_of_people:row[2], productivity:row[3] }))
}

export async function GET(e:APIEvent) {
  const url = new URL(e.request.url)
  const searchParams = url.searchParams
  
  const day = Number(searchParams.get('day') ?? "");
  const update_db = searchParams.get('update_db') ?? "";
  const reports = getReportURLs(day)

  const reqRescueTime = await fetch(reports.rescueTimeReportURL)
  const rescueJson:RescueSummary = await reqRescueTime.json();
  
  const reqWakatime = await fetch(reports.wakatimeReportURL)
  const wakaJson = await reqWakatime.json();

  const timestamp =  reports.date.toISOString();
  const wakaInsert = {date:timestamp, summary:wakaJson}
  
  
  const rescueInsert = getRescueInserts(rescueJson,timestamp);
  if(update_db === "true"){
    const rescuesql = await supabase.from('rescue-time-daily-summaries').insert(rescueInsert)
    const wakasql = await supabase.from('wakatime-daily-summaries').insert([
      wakaInsert
    ])
    if(wakasql.error || rescuesql.error ){
      return json({ status:'error' });
    }
  }

  return json({ rescueInsert,wakaInsert });
}