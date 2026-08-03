import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import util from 'util';

const execAsync = util.promisify(exec);

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const { stdout } = await execAsync(`osascript -e 'POSIX path of (choose folder with prompt "Select download directory")'`);
    const path = stdout.trim();
    if (path) {
      return NextResponse.json({ path });
    }
    return NextResponse.json({ path: null });
  } catch (err: any) {
    // If the user clicks "Cancel", it throws an error in AppleScript
    return NextResponse.json({ path: null });
  }
}
