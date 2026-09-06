// Upbit REST 프록시 — 브라우저 Origin 차별(429)을 우회하기 위해 서버사이드에서 대신 호출
// 배포: cd worker && npx wrangler deploy
const ALLOWED = new Set(['/v1/orderbook', '/v1/ticker', '/v1/market/all']);
export default {
  async fetch(req) {
    const url = new URL(req.url);
    // 필요한 공개 시세 엔드포인트만 허용
    if (!ALLOWED.has(url.pathname)) {
      return new Response('not found', { status: 404, headers: { 'Access-Control-Allow-Origin': '*' } });
    }
    const upstream = await fetch('https://api.upbit.com' + url.pathname + url.search, {
      headers: { Accept: 'application/json' },
      cf: { cacheTtl: 1, cacheEverything: true }, // 같은 초 내 중복 요청은 캐시로 흡수
    });
    const res = new Response(upstream.body, upstream);
    res.headers.set('Access-Control-Allow-Origin', '*');
    res.headers.delete('Set-Cookie');
    return res;
  },
};
