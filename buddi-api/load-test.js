import http from 'k6/http';
import { sleep, check } from 'k6';

export const options = {
    stages: [
        { duration: '10s', target: 10 },  // 10초 동안 10명으로 증가
        { duration: '30s', target: 30 },  // 30초 동안 30명 유지
        { duration: '10s', target: 0 },   // 10초 동안 0명으로 감소
    ],
};

const BASE_URL = 'http://localhost:8080';
const USERS = ['testfriend', 'minjun', 'jisu'];

export default function () {
    const username = USERS[__VU % USERS.length];

    // 로그인
    const loginRes = http.post(`${BASE_URL}/debug/login?username=${username}`, null, {
        tags: { name: 'login' },
    });
    check(loginRes, { 'login 200': r => r.status === 200 });

    const cookie = loginRes.headers['Set-Cookie'];
    const headers = cookie ? { Cookie: cookie.split(';')[0] } : {};

    sleep(0.5);

    // 방 목록 조회
    const roomsRes = http.get(`${BASE_URL}/api/rooms`, { headers, tags: { name: 'GET /api/rooms' } });
    check(roomsRes, { 'rooms 200': r => r.status === 200 });

    let roomId = null;
    if (roomsRes.status === 200) {
        const rooms = JSON.parse(roomsRes.body);
        if (rooms.length > 0) roomId = rooms[0].id;
    }

    sleep(0.5);

    // 지출 목록 조회
    const spendingsRes = http.get(`${BASE_URL}/api/spendings?year=2026&month=5`, { headers, tags: { name: 'GET /api/spendings' } });
    check(spendingsRes, { 'spendings 200': r => r.status === 200 });

    sleep(0.5);

    // 카테고리 통계
    const statsRes = http.get(`${BASE_URL}/api/stats/category?year=2026&month=5`, { headers, tags: { name: 'GET /api/stats/category' } });
    check(statsRes, { 'stats 200': r => r.status === 200 });

    sleep(0.5);

    // 주별 통계
    const weeklyRes = http.get(`${BASE_URL}/api/stats/weekly?year=2026&month=5`, { headers, tags: { name: 'GET /api/stats/weekly' } });
    check(weeklyRes, { 'weekly 200': r => r.status === 200 });

    sleep(0.5);

    // 피드 조회 (방이 있을 때만)
    if (roomId) {
        const feedRes = http.get(`${BASE_URL}/api/feed?roomId=${roomId}`, { headers, tags: { name: 'GET /api/feed' } });
        check(feedRes, { 'feed 200': r => r.status === 200 });
        sleep(0.5);
    }
}
