import { getDateString } from "./datetime.js";

function pad(number) {
    return (number < 10) ? '0' + number : number;
}

export function GeneratePeriodArray(startYear, startMonth, endYear, endMonth) {
    let result = [];

    for (let year = startYear; year <= endYear; year++) {
        for (let month = (year === startYear ? startMonth : 1); month <= (year === endYear ? endMonth : 12); month++) {
            result.push({period: `${year}-${pad(month)}`, periodType: "s-month"});
            if (month % 3 === 0) {
                result.push({period: `${year}-Q${month / 3}`, periodType: "s-quarter"});
            }
        }

        if (year !== endYear || endMonth === 12) {
            result.push({period: `${year}`, periodType: "s-year"});
        }
    }

    return result.reverse();
}

export const GetPrevStartEndDatesFromPeriod = (period) => {
    var date = new Date();
    var prevDate;
    var startDate;
    var endDate = getDateString();
  
    if (period === 'quarter') {
      let dateStart = new Date();
      dateStart.setMonth(date.getMonth() - 3);
      startDate = getDateString(dateStart);
      dateStart.setMonth(date.getMonth()-6);
      prevDate = getDateString(dateStart);
    } else if (period === 'year') {
      let dateStart = new Date();
      dateStart.setFullYear(date.getFullYear() - 1);
      startDate = getDateString(dateStart);
      dateStart.setFullYear(date.getFullYear()-2);
      prevDate = getDateString(dateStart);
    } else if (period.split('-').length == 2) {
      const [year, month] = period.split('-');
      if (month == 'Q1') {
        startDate = `${year}-01-01`;
        endDate = `${year}-03-31`;
        prevDate = `${year-1}-10-01`;
      } else if (month == 'Q2') {
        startDate = `${year}-04-01`;
        endDate = `${year}-06-30`;
        prevDate = `${year}-01-01`;
      } else if (month == 'Q3') {
        startDate = `${year}-07-01`;
        endDate = `${year}-09-30`;
        prevDate = `${year}-04-01`;
      } else if (month == 'Q4') {
        prevDate = `${year}-07-01`;
        startDate = `${year}-10-01`;
        endDate = `${year}-12-31`;
      } else if (parseInt(month) > 0 && parseInt(month) <= 12) {
        startDate = `${year}-${month}-01`;
        const last_date = new Date(year, month, 0).getDate();
        endDate = year + '-' + month + '-' + last_date;
        const sd = new Date(startDate);
        sd.setMonth(sd.getMonth()-1);
        prevDate = getDateString(sd);
      } else {
        let dateStart = new Date();
        dateStart.setMonth(date.getMonth() - 1);
        startDate = getDateString(dateStart);
        dateStart.setMonth(date.getMonth()-2);
        prevDate = getDateString(dateStart);
      }
    } else {
      let dateStart = new Date();
      dateStart.setMonth(date.getMonth() - 1);
      startDate = getDateString(dateStart)
      dateStart.setMonth(date.getMonth()-2);
      prevDate = getDateString(dateStart);
    }
 
    return {prevDate, startDate, endDate};
  }

  export const GetStartEndDatesFromPeriod = (period) => {
    var date = new Date();
    var startDate;
    var endDate = getDateString();
  
    if (period === 'quarter') {
      let dateStart = new Date();
      dateStart.setMonth(date.getMonth() - 3);
      startDate = getDateString(dateStart);
    } else if (period === 'year') {
      let dateStart = new Date();
      dateStart.setFullYear(date.getFullYear() - 1);
      startDate = getDateString(dateStart);
    } else if (period.split('-').length == 2) {
      const [year, month] = period.split('-');
      if (month == 'Q1') {
        startDate = `${year}-01-01`;
        endDate = `${year}-03-31`;
      } else if (month == 'Q2') {
        startDate = `${year}-04-01`;
        endDate = `${year}-06-30`;
      } else if (month == 'Q3') {
        startDate = `${year}-07-01`;
        endDate = `${year}-09-30`;
      } else if (month == 'Q4') {
        startDate = `${year}-10-01`;
        endDate = `${year}-12-31`;
      } else if (parseInt(month) > 0 && parseInt(month) <= 12) {
        startDate = `${year}-${month}-01`;
        const last_date = new Date(year, month, 0).getDate();
        endDate = year + '-' + month + '-' + last_date;
      } else {
        let dateStart = new Date();
        dateStart.setMonth(date.getMonth() - 1);
        startDate = getDateString(dateStart);
        dateStart.setMonth(date.getMonth()-2);
      }
    } else {
      let dateStart = new Date();
      dateStart.setMonth(date.getMonth() - 1);
      startDate = getDateString(dateStart)
      dateStart.setMonth(date.getMonth()-2);
    }
 
    return {startDate, endDate};
  }
  