import { Parser } from 'json2csv';

/**
 * Convert JSON data to CSV string
 */
export function jsonToCsv<T>(data: T[], fields?: string[]): string {
  try {
    const parser = new Parser({ fields });
    return parser.parse(data);
  } catch (error) {
    throw new Error('Error converting to CSV: ' + (error as Error).message);
  }
}

/**
 * Send CSV response
 */
export function sendCsvResponse(res: any, data: any[], filename: string, fields?: string[]) {
  const csv = jsonToCsv(data, fields);
  
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.send(csv);
}
