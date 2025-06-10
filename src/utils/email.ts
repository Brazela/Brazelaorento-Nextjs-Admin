import nodemailer from 'nodemailer';
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function sendCustomEmail({
  fromName,
  fromEmail,
  to,
  subject,
  closing,
  signature,
  why,
  blocks,
  formData,
}: {
  fromName: string;
  fromEmail: string;
  to: string;
  subject: string;
  closing: string;
  signature: string;
  why: string;
  blocks: { type: 'text' | 'image'; value: string }[];
  formData: FormData;
}) {
  // Build HTML content
  let contentHtml = '';
  
  
  
  // Add blocks
  for (let i = 0; i < blocks.length; ++i) {
    const block = blocks[i];
    if (block.type === 'text') {
      contentHtml += `
        <div style="margin-bottom: 20px; line-height: 1.6; color: #2d3748;">
          ${block.value.replace(/\n/g, '<br/>')}
        </div>
      `;
    } else if (block.type === 'image') {
      const file = formData.get(`image_${i}`) as File | null;
      if (file) {
        // Upload to Cloudinary
        const buffer = Buffer.from(await file.arrayBuffer());
        const base64String = buffer.toString('base64');
        const dataURI = `data:${file.type};base64,${base64String}`;
        const result = await cloudinary.uploader.upload(dataURI, {
          folder: 'emails',
        });
        contentHtml += `
          <div style="margin-bottom: 20px; text-align: center;">
            <img src="${result.secure_url}" style="max-width: 100%; height: auto; border-radius: 8px; border: 1px solid #e2e8f0;"/>
          </div>
        `;
      }
    }
  }
  
  // Handle document attachments
  let attachments: { filename: string, path: string }[] = [];
  const docCount = parseInt(formData.get('docCount') as string || '0');
  
  if (docCount > 0) {
    let docsHtml = `
      <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
        <div style="font-weight: 600; color: #2d3748; margin-bottom: 16px;">Attachments</div>
        <div style="display: flex; flex-wrap: wrap; gap: 12px;">
    `;
    
    for (let i = 0; i < docCount; ++i) {
      const file = formData.get(`doc_${i}`) as File | null;
      if (file) {
        const buffer = Buffer.from(await file.arrayBuffer());
        const base64String = buffer.toString('base64');
        const dataURI = `data:${file.type};base64,${base64String}`;
        const result = await cloudinary.uploader.upload(dataURI, {
          folder: 'emails',
          resource_type: file.type.startsWith('image/') ? 'image' : 'auto',
        });
        
        docsHtml += `
          <div style="flex: 0 0 calc(50% - 6px); background: #f7fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 12px; display: flex; align-items: center;">
            <div style="width: 40px; height: 40px; background: #ebf8ff; border-radius: 6px; display: flex; align-items: center; justify-content: center; margin-right: 12px;">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="#4299e1" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M14 2V8H20" stroke="#4299e1" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M16 13H8" stroke="#4299e1" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M16 17H8" stroke="#4299e1" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M10 9H9H8" stroke="#4299e1" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <div style="flex: 1; min-width: 0;">
              <div style="font-weight: 500; color: #2d3748; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${file.name}</div>
              <a href="${result.secure_url}" target="_blank" rel="noopener noreferrer" style="color: #4299e1; font-size: 13px; text-decoration: none; display: inline-block; margin-top: 4px;">Download</a>
            </div>
          </div>
        `;
        
        attachments.push({ filename: file.name, path: result.secure_url });
      }
    }
    
    docsHtml += `</div></div>`;
    contentHtml += docsHtml;
  }
  
  // Signature
  contentHtml += `
    <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
      <div style="margin-bottom: 8px;">${closing},</div>
      <div style="font-weight: 600; color: #2d3748;">${signature}</div>
    </div>
  `;
  
  // Full email HTML
  const html = `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="utf-8">
    <title>${subject}</title>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <style>
      body, table, td, div, p, a {
        -webkit-text-size-adjust: 100%;
        -ms-text-size-adjust: 100%;
        margin: 0;
        padding: 0;
        border: 0;
        font-family: 'Source Sans Pro', Helvetica, Arial, sans-serif;
        line-height: 1.5;
        color: #2d3748;
      }
      
      img {
        border: 0;
        line-height: 100%;
        outline: none;
        -ms-interpolation-mode: bicubic;
        max-width: 100%;
        height: auto;
      }
      
      table {
        border-collapse: collapse !important;
        width: 100%;
      }
      
      .container {
        max-width: 600px;
        margin: 0 auto;
        background-color: #ffffff;
        border-radius: 8px;
        overflow: hidden;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
      }
      
      .btn {
        display: inline-block;
        padding: 12px 24px;
        font-size: 15px;
        color: #fff;
        text-decoration: none;
        background-color: #4299e1;
        border-radius: 6px;
        text-align: center;
        font-weight: 600;
        transition: background-color 0.2s;
      }
      
      .btn:hover {
        background-color: #3182ce;
      }
      
      .footer-icons a {
        margin: 0 8px;
        text-decoration: none;
        display: inline-block;
        vertical-align: middle;
      }
      
      .footer-icons img {
        width: 24px;
        height: 24px;
        vertical-align: middle;
      }
      
      @media screen and (max-width: 600px) {
        .container {
          width: 100% !important;
          border-radius: 0;
        }
        
        .mobile-padding {
          padding-left: 20px !important;
          padding-right: 20px !important;
        }
        
        .mobile-text-center {
          text-align: center !important;
        }
      }
      
      .brand-name {
        font-family: 'Bradley Hand', cursive;
        font-size: 24px;
        color: #78dee6;
        letter-spacing: 4px;
        text-transform: uppercase;
        text-align: center;
        margin: 15px 0;
      }
      
      .expiry-note {
        color: #e53e3e;
        font-weight: 500;
        margin: 15px 0;
      }
      
      .support-link {
        color: #4299e1;
        text-decoration: none;
        transition: color 0.2s;
      }
      
      .support-link:hover {
        color: #3182ce;
        text-decoration: underline;
      }
      
      .footer {
        background-color: #2f2f2f;
        color: #cbd5e0;
        padding: 30px 20px;
        text-align: center;
      }
      
      .copyright {
        font-family: Monaco, monospace;
        font-size: 12px;
        color: #a0aec0;
        margin: 15px 0;
      }

      .logo-name {
        color: #78dee6;
        font-size: 20px;
        letter-spacing: 8px;
        text-transform: uppercase;
        font-weight: bold;
        text-align: center;
        margin-bottom: 15px;
      }
    </style>
  </head>
  <body style="background-color: #f7fafc; margin: 0; padding: 20px 0;">
    <table class="container" align="center" cellpadding="0" cellspacing="0" bgcolor="#ffffff">
      <tr>
        <td align="center" bgcolor="#ebf8ff" style="padding: 36px 24px;">
          <div class="logo-name">Brazelaorento</div>
        </td>
      </tr>
      
      <tr>
        <td bgcolor="#ffffff" style="padding: 36px 40px;" class="mobile-padding">
          ${contentHtml}
        </td>
      </tr>
      
      <tr>
        <td class="footer">
          <div class="logo-name" style="color: #78dee6; margin-bottom: 15px;">Brazelaorento</div>
          
          <p style="color: #a0aec0; font-size: 14px; margin-bottom: 20px; line-height: 1.5; max-width: 500px; margin-left: auto; margin-right: auto;">
            This email was sent to ${to}. If you believe this was sent in error, please contact the sender.
          </p>
          
          <div class="footer-icons" style="margin: 20px 0;">
            <a href="https://bit.ly/BrazelaYoutube" target="_blank" style="margin: 0 10px;">
              <img src="https://cdn-icons-png.flaticon.com/512/1384/1384060.png" alt="YouTube" style="width: 28px; height: 28px;">
            </a>
            <a href="https://bit.ly/BrazelaT" target="_blank" style="margin: 0 10px;">
              <img src="https://cdn-icons-png.flaticon.com/128/14417/14417460.png" alt="Twitter" style="width: 28px; height: 28px;">
            </a>
           
          </div>
          
          <p class="copyright">Brazelaorento &copy; ${new Date().getFullYear()} All Rights Reserved</p>
          
          <p style="font-size: 14px; color: #e53e3e; line-height: 1.5; margin-top: 15px;">
            ${why}
          </p>
        </td>
      </tr>
    </table>
  </body>
  </html>
  `;

  // Setup nodemailer
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  await transporter.sendMail({
    from: `${fromName} <${fromEmail}>`,
    to,
    subject,
    html,
    // Optionally, you could attach files directly if you want to download them in the email client
    // attachments: attachments.length > 0 ? attachments : undefined,
  });
}