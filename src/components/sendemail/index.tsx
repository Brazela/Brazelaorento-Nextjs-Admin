import React, { useState } from "react";
import SendEmailModal from "../ui/modals/SendEmailModal";

const SendEmailPage: React.FC = () => {
  const [open, setOpen] = useState(true);
  return (
    <>
      <SendEmailModal isOpen={open} onClose={() => setOpen(false)} />
      {/* Optionally, you can add a fallback or redirect if modal is closed */}
    </>
  );
};

export default SendEmailPage;
