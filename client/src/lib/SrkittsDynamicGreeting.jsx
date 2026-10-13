import React from 'react'
import hello from "@sirkitts/hello"



function gitTimeOfDay() {
  const hour = new Date().getHours();
  if (hour < 12) {
    return "Good morning";
  } else if (hour < 18) {
    return "Good afternoon";
  } else {
    return "Good evening";
  }
}

export default function SrkittsDynamicGreeting({ name }) {
  return (
    <div>
       <h1>
      {hello({
        name,
        greetings: gitTimeOfDay(),
        exclamation: "",
      })}💕.
    </h1>
    </div>
  )
}
