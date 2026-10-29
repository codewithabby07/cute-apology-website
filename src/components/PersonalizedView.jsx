import React, { useState, useEffect } from "react";
import { platformApi } from "../lib/supabase.js";
import { getTemplate } from "../registry/index.js";

export default function PersonalizedView({ slug }) {
  const [loading, setLoading] = useState(true);
  const [linkData, setLinkData] = useState(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadLink() {
      setLoading(true);
      try {
        const link = await platformApi.getLinkBySlug(slug);
        if (!isMounted) return;

        if (!link || !link.is_active) {
          setNotFound(true);
          setLoading(false);
          return;
        }

        setLinkData(link);
        setNotFound(false);
        setLoading(false);

        // Record page view asynchronously
        platformApi.recordLinkView(slug).catch(() => {});
      } catch (err) {
        if (!isMounted) return;
        setNotFound(true);
        setLoading(false);
      }
    }

    if (slug) {
      loadLink();
    } else {
      setNotFound(true);
      setLoading(false);
    }

    return () => {
      isMounted = false;
    };
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#FBF5F4] p-4 text-center">
        <div className="w-12 h-12 border-4 border-[#EE95BB]/30 border-t-[#d84b5a] rounded-full animate-spin mb-4"></div>
        <p className="font-['Montserrat'] text-sm tracking-wide text-gray-500">
          Unwrapping your apology with love... 🤍
        </p>
      </div>
    );
  }

  if (notFound || !linkData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FBF5F4] p-4 font-['Montserrat']">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 text-center shadow-lg border border-[#f1dede]">
          <div className="w-20 h-20 mx-auto mb-5 rounded-full bg-[#fae8e8] flex items-center justify-center text-3xl">
            💌
          </div>
          <h2 className="text-2xl font-bold text-gray-800 font-['Playfair_Display'] mb-3">
            Apology Unavailable
          </h2>
          <p className="text-gray-600 text-sm leading-relaxed mb-6">
            This personalized apology page is either inactive, has expired, or the link address is incorrect.
          </p>
          <a
            href="/"
            className="inline-block px-6 py-2.5 rounded-full bg-[#d84b5a] hover:bg-[#c33d4b] text-white text-sm font-semibold tracking-wide transition shadow-sm"
          >
            Go to Home
          </a>
        </div>
      </div>
    );
  }

  // Retrieve the registered template
  const template = getTemplate(linkData.template_id);
  const TemplateComponent = template ? template.component : null;

  if (!TemplateComponent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FBF5F4] p-4 font-['Montserrat']">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 text-center shadow-lg border border-[#f1dede]">
          <h2 className="text-xl font-bold text-gray-800 mb-2">Template Not Found</h2>
          <p className="text-gray-600 text-sm">Template `{linkData.template_id}` is not currently available.</p>
        </div>
      </div>
    );
  }

  return (
    <TemplateComponent
      senderName={linkData.sender_name}
      receiverName={linkData.receiver_name}
      customData={linkData.custom_data}
    />
  );
}
