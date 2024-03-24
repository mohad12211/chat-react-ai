import React, { useState } from 'react'
import { useNavigate } from "react-router-dom"
import user from "../assets/user.png";

const url = process.env.NODE_ENV === 'production' ? "https://typological.me/profile" : "http://localhost:4000/profile"

const Home = ({ socket }) => {
    const navigate = useNavigate()
    const [userName, setUserName] = useState("")
    const [pfp, setPfp] = useState(user);

    const handleSubmit = async (e) => {
        e.preventDefault()
        const formData = new FormData(e.target);
        await fetch(url, {
            method: 'POST',
            body: formData
        });
        localStorage.setItem("userName", userName)
        socket.emit("newUser", { userName, socketID: socket.id })
        navigate("/chat")
    }
    const handlePfpChange = (e) => {
        let file = e.target.files[0];
        if (file) {
            let reader = new FileReader();
            reader.onload = async (e2) => {
                let fileObject = reader.result || e2.target.result;
                setPfp(fileObject);
            };
            reader.readAsDataURL(file);
        }
    }

    return (
        <form className='home__container' onSubmit={handleSubmit}>
            <h2 className='home__header'>Sign in to Open Chat</h2>
            <img src={pfp} alt="profile" style={{ width: "100px", height: "100px", borderRadius: "50%" }} />
            <input style={{ display: "inline", marginBottom: "20px" }} type="file" name={socket.id} id="uploadInput" accept="image/png, image/jpeg" onChange={handlePfpChange} />
            <label htmlFor="username">Username</label>
            <input type="text"
                name="username"
                id='username'
                className='username__input'
                value={userName}
                onChange={e => setUserName(e.target.value)}
            />
            <button className='home__cta'>SIGN IN</button>
        </form>
    )
}

export default Home
