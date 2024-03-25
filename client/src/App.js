import { Routes, Route, MemoryRouter } from "react-router-dom"
import Home from "./components/Home"
import ChatPage from "./components/ChatPage";
import socketIO from "socket.io-client"

const url = process.env.NODE_ENV === 'production' ? "https://typological.me" : "http://localhost:4000"

const socket = socketIO.connect(url)
function App() {
  return (
    <MemoryRouter>
      <div>
        <Routes>
          <Route path="/" element={<Home socket={socket} />}></Route>
          <Route path="/chat" element={<ChatPage socket={socket} />}></Route>
        </Routes>
      </div>
    </MemoryRouter>

  );
}

export default App;
