import * as XLSX from 'xlsx'

// Export jobs to CSV
export const exportToCSV = (jobs, filename = 'jobs-export') => {
  if (!jobs || !Array.isArray(jobs) || jobs.length === 0) {
    throw new Error('No data to export')
  }

  // Prepare CSV data
  const headers = ['Date', 'Company', 'Job Title', 'Location', 'Status', 'Link', 'Notes']
  const rows = jobs.map(job => [
    job.date || '',
    job.companyName || '',
    job.jobTitle || '',
    job.location || '',
    job.status || '',
    job.jobLink || '',
    job.notes || ''
  ])

  // Create CSV content
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
  ].join('\n')

  // Create blob and download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  
  link.setAttribute('href', url)
  link.setAttribute('download', `${filename}-${new Date().toISOString().split('T')[0]}.csv`)
  link.style.visibility = 'hidden'
  
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  
  URL.revokeObjectURL(url)
}

// Export jobs to Excel
export const exportToExcel = (jobs, filename = 'jobs-export') => {
  if (!jobs || !Array.isArray(jobs) || jobs.length === 0) {
    throw new Error('No data to export')
  }

  // Prepare worksheet data
  const worksheetData = [
    ['Date', 'Company', 'Job Title', 'Location', 'Status', 'Link', 'Notes'],
    ...jobs.map(job => [
      job.date || '',
      job.companyName || '',
      job.jobTitle || '',
      job.location || '',
      job.status || '',
      job.jobLink || '',
      job.notes || ''
    ])
  ]

  // Create workbook and worksheet
  const workbook = XLSX.utils.book_new()
  const worksheet = XLSX.utils.aoa_to_sheet(worksheetData)

  // Set column widths
  worksheet['!cols'] = [
    { wch: 12 }, // Date
    { wch: 20 }, // Company
    { wch: 30 }, // Job Title
    { wch: 20 }, // Location
    { wch: 12 }, // Status
    { wch: 40 }, // Link
    { wch: 30 }  // Notes
  ]

  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Jobs')

  // Generate Excel file and download
  XLSX.writeFile(workbook, `${filename}-${new Date().toISOString().split('T')[0]}.xlsx`)
}

