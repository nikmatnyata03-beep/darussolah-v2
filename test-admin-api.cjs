async function test() {
  const tokenReq = await fetch('http://localhost:3000/v1/private/yayasan-darussolah-wal-jinan/me', {
    headers: { 'Authorization': 'Bearer test_token_missing' }
  });
  console.log('Test unauth:', tokenReq.status);
}
test();
