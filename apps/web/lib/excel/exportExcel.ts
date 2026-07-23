import ExcelJS from 'exceljs'

export async function createExcel(
  sheetName: string,
  columns: any[],
  rows: any[]
) {
  const workbook = new ExcelJS.Workbook()

  const worksheet = workbook.addWorksheet(sheetName)

  worksheet.columns = columns

  worksheet.addRows(rows)

  worksheet.getRow(1).font = {
    bold: true
  }

  const buffer = await workbook.xlsx.writeBuffer()

  return buffer
}