import request from '@/utils/customFetch';
import { NextRequest, NextResponse } from "next/server";

export async function GET(next_request: NextRequest) {
  const response = NextResponse.redirect(new URL('/', next_request.url));
  await request(`${process.env.NEXT_PUBLIC_BACKEND_IP}/logout`, {method: 'GET', cache: 'no-cache', headers: {'Authorization': `Bearer ${next_request.cookies.get('token')?.value}`, 'Content-Type': 'application/json', 'Accept': 'application/json'}})
  response.cookies.delete('token')
  response.cookies.delete('username')
  response.cookies.delete('currentId')
  response.cookies.delete('collegeId')
  response.cookies.delete('currentUser')
  response.cookies.delete('currentRole')
  response.cookies.delete('currentRollno')
  return response;
}