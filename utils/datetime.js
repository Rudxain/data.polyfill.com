
export const getDateString = (date = new Date()) => {
    let day = ('0' + date.getDate()).slice(-2);
    let month = ('0' + (date.getMonth() + 1)).slice(-2);
    let year = date.getFullYear();
    return year + '-' + month + '-' + day;
}

export const getMonthDayString = (date = new Date()) => {
    let day = '01';
    let month = ('0' + (date.getMonth() + 1)).slice(-2);
    let year = date.getFullYear();
    return year + '-' + month + '-' + day;
}

export const getDateTimeString = (dateTime = new Date()) => {
    const formattedDate = dateTime.getFullYear() + '-' +
        ('0' + (dateTime.getMonth() + 1)).slice(-2) + '-' +
        ('0' + dateTime.getDate()).slice(-2) + ' ' +
        ('0' + dateTime.getHours()).slice(-2) + ':' +
        ('0' + dateTime.getMinutes()).slice(-2) + ':' +
        ('0' + dateTime.getSeconds()).slice(-2);
    return formattedDate;
}