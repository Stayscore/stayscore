import React from 'react'
import { createRoot } from 'react-dom/client'

function useApi(){ 
  const base = import.meta.env.VITE_API_BASE; 
  return {
    login: async (email, password) => {
      const r = await fetch(base + '/auth/login', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({email,password}) });
      return r.json();
    },
    ratings: async (token) => {
      const r = await fetch(base + '/ratings', { headers: { 'Authorization': 'Bearer '+token } });
      return r.json();
    }
  };
}

function App(){
  const api = useApi();
  const [email, setEmail] = React.useState('hotel.alpenblick@example.com');
  const [password, setPassword] = React.useState('Passwort123');
  const [token, setToken] = React.useState('');
  const [ratings, setRatings] = React.useState([]);

  async function handleLogin(){
    const res = await api.login(email, password);
    if(res.token){ 
      setToken(res.token); 
      const rs = await api.ratings(res.token);
      setRatings(rs);
    } else { alert('Login fehlgeschlagen'); }
  }

  return (
    <div style={{fontFamily:'system-ui', padding:20, maxWidth:900, margin:'0 auto'}}>
      <h1>StayScore Admin – Demo</h1>
      {!token && (
        <div style={{display:'flex', gap:8, margin:'12px 0'}}>
          <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="E-Mail"/>
          <input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Passwort"/>
          <button onClick={handleLogin}>Login</button>
        </div>
      )}
      {token && (
        <div>
          <p><b>Angemeldet.</b> Beispiel-Bewertungen:</p>
          <div style={{display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:12}}>
            {ratings.map((r)=> (
              <div key={r.id} style={{border:'1px solid #ddd', borderRadius:8, padding:12}}>
                <div style={{fontSize:18, fontWeight:700}}>{'★'.repeat(r.stars)}<span style={{opacity:.5}}>{'★'.repeat(5-r.stars)}</span></div>
                <div style={{marginTop:6, color:'#333'}}>{r.comment}</div>
                <div style={{marginTop:8, fontSize:12, color:'#666'}}>Betrieb: {r.venue}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

createRoot(document.getElementById('root')).render(<App/>)
