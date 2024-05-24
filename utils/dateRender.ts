export default function displayDate(date_string: string) {
  const date = new Date(date_string)
  const hours = date.getHours()
  const minutes = date.getMinutes()
  const months: any = { 0: 'Jan', 1: 'Feb', 2: 'Mar', 3: 'Apr', 4: 'May', 5: 'Jun', 6: 'Jul', 7: 'Aug', 8: 'Sep', 9: 'Oct', 10: 'Nov', 11: 'Dec' }
  return `${(date.getDate() + '').padStart(2, '0')} ${months[date.getMonth()]} ${((hours % 12) + '').padStart(2, '0')}:${(minutes + '').padStart(2, '0')} ${(hours < 12) ? 'AM' : 'PM'}`
}