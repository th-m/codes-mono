
import invariant from 'tiny-invariant';
import { supabase } from '~/models/users.server';
import { APIEvent, json } from "solid-start/api";

const resuceTimeKey = process.env.RESCUE_TIME_KEY;
const wakatimeKey = process.env.WAKA_TIME_KEY;

invariant(
  resuceTimeKey,
  'resuceTimeKey must be set in your environment variables.'
);
invariant(
  wakatimeKey,
  'wakatimeKey must be set in your environment variables.'
);


const constructIntervalTime = (date:Date) => {
  return `${date.getFullYear()}-${date.getMonth()+1}-${date.getDate()}`
}

const getReportURLs= (dayOffset:number) => {
  const date = new Date(Date.now() - dayOffset * 24 * 60 * 60 * 1000);  
  const interval = constructIntervalTime(date)
  const rescueTimeInterval ='day'
  // https://www.rescuetime.com/rtx/developers
  const rescueTimeReportURL = `https://www.rescuetime.com/anapi/data?key=${resuceTimeKey}&perspective=interval&restrict_kind=productivity&interval=${rescueTimeInterval}&restrict_begin=${interval}&restrict_end=${interval}&format=json`
  // https://wakatime.com/developers
  const wakatimeReportURL = `https://wakatime.com/api/v1/users/current/summaries?api_key=${wakatimeKey}&start=${interval}&end=${interval}`
  return {
    date,
    rescueTimeReportURL,
    wakatimeReportURL
  }

}
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