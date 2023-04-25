import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import { api } from "../utils/api";

const Register = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [email, setEmail] = useState("");

  const navigate = useNavigate();

  const register = async () => {
    // if (!isInputValid()) {
    //   alert("Enter valid username and password");
    //   return;
    // }

    const req = {
      username,
      password,
      email,
    };

    await api
      .post("/user/signup", req)
      .then(({ data }) => {
        // console.log(data);
        navigate("/login");
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const login = () => {
    navigate("/login");
  };

  const isInputValid = () => {
    return (
      username.trim() !== "" &&
      password.trim() !== "" &&
      email.trim() !== "" &&
      password === confirmPassword
    );
  };

  return (
    <div className="flex flex-col justify-center items-center mx-auto my-20">
      <h1 className="text-3xl font-bold text-pink-500">
        Register to Goneticphar
      </h1>

      <div className="flex flex-col p-8 mt-16 border border-pink-500 rounded-xl shadow-xl">
        <h3 className="text-xl font-semibold mb-2">Email</h3>
        <input
          type="email"
          onChange={(e) => setEmail(e.target.value)}
          className="border rounded-lg w-full px-4 py-2"
        />
        <h3 className="text-xl font-semibold mb-2 mt-4">Username</h3>
        <input
          type="text"
          onChange={(e) => setUsername(e.target.value)}
          className="border rounded-lg w-full px-4 py-2"
        />
        <div className="flex w-full">
          <div className="flex flex-col w-full">
            <h3 className="text-xl font-semibold mb-2 mt-4">Password</h3>
            <input
              type="password"
              onChange={(e) => setPassword(e.target.value)}
              className="border rounded-lg w-full px-4 py-2"
            />
          </div>
          <div className="flex flex-col w-full ml-4">
            <h3 className="text-xl font-semibold mb-2 mt-4">
              Confirm Password
            </h3>
            <input
              type="password"
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="border rounded-lg w-full px-4 py-2"
            />
          </div>
        </div>

        {/* Button Section */}
        <div className="flex flex-col w-full mt-8">
          <button
            onClick={register}
            disabled={!isInputValid()}
            className={`font-bold p-4 mt-4 w-full rounded-xl ${
              !isInputValid()
                ? `bg-gray-300 text-gray-100`
                : `bg-pink-500 text-white`
            }`}
          >
            Register
          </button>
          <button
            onClick={login}
            className="font-bold p-4 mt-4 w-full border-2 rounded-xl"
          >
            Already have an account
          </button>
        </div>
      </div>
    </div>
  );
};

export default Register;
