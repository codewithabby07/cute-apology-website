import React from "react";

/**
 * BirthdayWish Component
 * Wraps the Cutiepage Birthday Wish v2 engine with full dynamic personalization
 */
export default function BirthdayWish({ senderName, receiverName, customData }) {
  const name = receiverName || "Favourite Person";
  const from = senderName || "Someone Special";
  const age = (customData && customData.age) || "20";
  const date = (customData && customData.birthdayDate) || "28 September";

  const queryParams = new URLSearchParams({
    name: name,
    from: from,
    age: age,
    date: date
  }).toString();

  const iframeSrc = `/birthday-wish-template/index.html?${queryParams}`;

  return (
    <div className="relative w-full min-h-screen bg-[#fff4e3] overflow-hidden">
      <iframe
        src={iframeSrc}
        title={`Birthday Wish for ${name}`}
        className="w-full h-screen border-0 block"
        allow="autoplay; camera; microphone"
      />
    </div>
  );
}
