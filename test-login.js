const testLogin = async () => {
  try {
    const res = await fetch('http://localhost:3001/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'ahilesh950@gmail.com', password: 'somepassword' })
    });
    const text = await res.text();
    console.log(`STATUS: ${res.status}`);
    console.log(`BODY: ${text}`);
  } catch (err) {
    console.error(err);
  }
};
testLogin();
