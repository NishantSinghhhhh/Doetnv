"use client";

import { useState, useRef, useEffect } from "react";
import { useGreeting } from "../hooks/useGreeting";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { toast } from "react-toastify";

const Greeting = () => {
  const [newGreeting, setNewGreeting] = useState<string>("");
  const newGreetingInputRef = useRef<HTMLInputElement>(null);

  const onSetGreetingSuccess = () => {
    toast.success(`Successfully set your new greeting`, {
      position: "bottom-center",
      autoClose: 3000,
      hideProgressBar: true,
      closeOnClick: true,
      pauseOnHover: true,
      theme: "light",
      className: "text-sm",
    });
    setNewGreeting("");
    newGreetingInputRef.current?.blur();
  };

  const {
    address,
    greeting,
    getGreetingLoading,
    getGreetingError,
    setGreeting,
    setGreetingLoading,
    prepareSetGreetingError,
    setGreetingError,
  } = useGreeting({ newGreeting, onSetGreetingSuccess });

  useEffect(() => {
    if (!address) {
      setNewGreeting("");
    }
  }, [address]);

  const { openConnectModal } = useConnectModal();

  return (
    <div className="space-y-8">
      <div className="flex flex-col space-y-4">
        <p className="text-sm text-gray-500 text-center">
          Greeting from the blockchain:
        </p>
        {getGreetingLoading ? (
          <p className="text-lg text-center text-gray-500 italic">Loading...</p>
        ) : (
          <p
            className={
              !getGreetingError
                ? `text-lg text-center font-medium`
                : `text-lg text-center text-red-500`
            }
          >
            {!getGreetingError
              ? greeting
              : `There was an error getting the greeting`}
          </p>
        )}
      </div>
      <div className="space-y-6">
        <div className="flex flex-col space-y-4">
          <input
            className="border border-gray-300 rounded-lg p-4 text-center focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            onChange={(e) => setNewGreeting(e.target.value)}
            placeholder="Write a new greeting"
            ref={newGreetingInputRef}
            disabled={!address}
            value={newGreeting}
          />
          <button
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white py-3 px-6 rounded-lg font-medium transition-colors shadow-sm hover:shadow"
            onClick={setGreeting}
            disabled={
              !address ||
              !newGreeting ||
              setGreetingLoading ||
              !!prepareSetGreetingError
            }
          >
            {!setGreetingLoading
              ? `Set your new greeting on the blockchain`
              : `Setting greeting...`}
          </button>
          {!address && (
            <button
              className="text-sm text-gray-500 text-center underline hover:opacity-80 transition-opacity"
              onClick={openConnectModal}
            >
              Connect your wallet to set a new greeting
            </button>
          )}
          {address && !newGreeting && (
            <p className="text-sm text-gray-500 text-center">
              Type something to set a new greeting
            </p>
          )}
          {setGreetingError && (
            <p className="text-sm text-red-500 text-center">
              There was an error setting your new greeting
            </p>
          )}
          {newGreeting && prepareSetGreetingError && (
            <p className="text-sm text-red-500 text-center">
              Sorry, only the contract owner can set a greeting
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export { Greeting };