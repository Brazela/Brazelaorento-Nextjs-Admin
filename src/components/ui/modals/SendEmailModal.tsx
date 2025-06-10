import React, { useState } from "react";
import { Modal } from "../modals";
import Button from "../buttons";

interface EmailBlock {
  type: "text" | "image";
  value: string;
  file?: File | null;
  preview?: string;
}

interface SendEmailModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const DEFAULT_FROM_NAME = "Brazelaorento Support";
const DEFAULT_FROM_EMAIL = "admin@brazelaorento.link";
const DEFAULT_CLOSING = "Regards";
const DEFAULT_SIGNATURE = "Brazelaorento Support";
const DEFAULT_WHY = "Please do not reply to this message. For general inquiries or to request support, please fill in contact form in home page of <a href='http://main.brazelaorento.link/#contact'>Brazelaorento</a> website.";
const MAX_IMAGE_SIZE = 2 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];

const SendEmailModal: React.FC<SendEmailModalProps> = ({ isOpen, onClose }) => {
  const [fromName, setFromName] = useState(DEFAULT_FROM_NAME);
  const [fromEmail, setFromEmail] = useState(DEFAULT_FROM_EMAIL);
  const [to, setTo] = useState("");
  const [subject, setSubject] = useState("");
  const [blocks, setBlocks] = useState<EmailBlock[]>([]);
  const [closing, setClosing] = useState(DEFAULT_CLOSING);
  const [signature, setSignature] = useState(DEFAULT_SIGNATURE);
  const [why, setWhy] = useState(DEFAULT_WHY);
  const [errors, setErrors] = useState<Record<string, string>>( {} );
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleAddBlock = (type: "text" | "image") => {
    setBlocks([...blocks, { type, value: "", file: null, preview: "" }]);
  };

  const handleBlockChange = (idx: number, value: string) => {
    setBlocks(blocks.map((b, i) => (i === idx ? { ...b, value } : b)));
  };

  const handleImageChange = (idx: number, file: File | null) => {
    if (!file) return;
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      setErrors((prev) => ({ ...prev, [`block_${idx}`]: "Invalid image type." }));
      return;
    }
    if (file.size > MAX_IMAGE_SIZE) {
      setErrors((prev) => ({ ...prev, [`block_${idx}`]: "Image exceeds 2MB." }));
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setBlocks((prev) => prev.map((b, i) => i === idx ? { ...b, file, preview: reader.result as string } : b));
      setErrors((prev) => ({ ...prev, [`block_${idx}`]: "" }));
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveBlock = (idx: number) => {
    setBlocks(blocks.filter((_, i) => i !== idx));
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!fromEmail) errs.fromEmail = "From email required";
    if (!to) errs.to = "To email required";
    else if (!emailRegex.test(to)) errs.to = "To email is not valid";
    if (!subject) errs.subject = "Subject required";
    if (blocks.length === 0) errs.content = "Content is required";
    blocks.forEach((b, i) => {
      if (b.type === "text" && !b.value) errs[`block_${i}`] = "Text required";
      if (b.type === "image" && !b.file) errs[`block_${i}`] = "Image required";
    });
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // Helper to redirect to home with optional message
  const redirectHome = (msg?: string) => {
    if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
  };

  // Close modal and redirect
  const handleClose = () => {
    redirectHome();
  };

  // Listen for modal close (click outside or X button)
  // Modal should call onClose, so we use handleClose

  const handleSubmit = async () => {
    if (!validate()) return;
    setSending(true);
    setSuccess(null);
    setErrorMsg(null);
    const formData = new FormData();
    formData.append("fromName", fromName);
    formData.append("fromEmail", fromEmail);
    formData.append("to", to);
    formData.append("subject", subject);
    formData.append("closing", closing);
    formData.append("signature", signature);
    formData.append("why", why);
    formData.append("blocks", JSON.stringify(blocks.map((b, i) => ({ type: b.type, value: b.type === "image" ? `__image_${i}__` : b.value }))));
    blocks.forEach((b, i) => {
      if (b.type === "image" && b.file) {
        formData.append(`image_${i}`, b.file);
      }
    });
    try {
      const res = await fetch("/api/admin/sendemail", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) throw new Error(await res.text());
      setSuccess("Email sent successfully!");
      setTimeout(() => redirectHome("success"), 1200);
    } catch (e: any) {
      setErrorMsg(e.message || "Failed to send email");
    } finally {
      setSending(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Send Email" size="lg">
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-500">From Name</label>
            <input className="w-full rounded border px-3 py-2 text-cyan-500" value={fromName} onChange={e => setFromName(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-500">From Email</label>
            <input className="w-full rounded border px-3 py-2 text-cyan-500" value={fromEmail} onChange={e => setFromEmail(e.target.value)} />
            {errors.fromEmail && <p className="text-red-500 text-xs mt-1">{errors.fromEmail}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-500">To</label>
            <input className="w-full rounded border px-3 py-2 text-cyan-500" value={to} onChange={e => setTo(e.target.value)} />
            {errors.to && <p className="text-red-500 text-xs mt-1">{errors.to}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-500">Subject</label>
            <input className="w-full rounded border px-3 py-2 text-cyan-500" value={subject} onChange={e => setSubject(e.target.value)} />
            {errors.subject && <p className="text-red-500 text-xs mt-1">{errors.subject}</p>}
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-500">Content</label>
          <div className="text-xs text-gray-400 mb-2">Please add a greeting (e.g., Hi, User) manually as the first text block. To add a new paragraph or line, use another text block for each new line.</div>
          <div className="space-y-2">
            {errors.content && <p className="text-red-500 text-xs mb-1">{errors.content}</p>}
            {blocks.map((block, idx) => (
              <div key={idx} className="flex items-center gap-2">
                {block.type === "text" ? (
                  <>
                    <textarea
                      className="w-full rounded border px-3 py-2 text-cyan-500"
                      value={block.value}
                      onChange={e => handleBlockChange(idx, e.target.value)}
                      placeholder="Text content"
                    />
                  </>
                ) : (
                  <>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={e => handleImageChange(idx, e.target.files?.[0] || null)}
                      className="text-cyan-500 file:rounded file:border-0 file:bg-gray-200 file:px-3 file:py-2 file:text-sm file:cursor-pointer file:hover:bg-gray-300"
                      placeholder="Upload image"
                    />
                    {block.preview && (
                      <img src={block.preview} alt="Preview" className="w-16 h-16 object-contain border rounded" />
                    )}
                  </>
                )}
                <button type="button" className="text-red-500 ml-2" onClick={() => handleRemoveBlock(idx)}>
                  Remove
                </button>
                {errors[`block_${idx}`] && <p className="text-red-500 text-xs ml-2">{errors[`block_${idx}`]}</p>}
              </div>
            ))}
            <div className="flex gap-2 mt-2">
              <Button type="button" variant="secondary" onClick={() => handleAddBlock("text")}>+ Text</Button>
              <Button type="button" variant="secondary" onClick={() => handleAddBlock("image")}>+ Image</Button>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-500">Email Closing Regards</label>
            <input className="w-full rounded border px-3 py-2 text-cyan-500" value={closing} onChange={e => setClosing(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-500">Signature</label>
            <input className="w-full rounded border px-3 py-2 text-cyan-500" value={signature} onChange={e => setSignature(e.target.value)} />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1 text-gray-500">Why send email</label>
            <input className="w-full rounded border px-3 py-2 text-cyan-500" value={why} onChange={e => setWhy(e.target.value)} />
          </div>
        </div>
        {success && <p className="text-green-600 text-sm">{success}</p>}
        {errorMsg && <p className="text-red-600 text-sm">{errorMsg}</p>}
        <div className="flex justify-end gap-2 mt-4">
          <Button variant="secondary" onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSubmit} {...(sending ? { 'aria-disabled': true, style: { opacity: 0.6, pointerEvents: 'none' } } : {})}>
            {sending ? "Sending..." : "Send Email"}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default SendEmailModal;
