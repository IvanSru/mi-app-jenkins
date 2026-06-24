let messaging = null;

try {
  const admin = require('firebase-admin');

  if (process.env.FIREBASE_PROJECT_ID && !admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId:   process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey:  process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
    });
    messaging = admin.messaging();
    console.log('✅ Firebase Admin inicializado');
  }
} catch {
  console.warn('⚠️  Firebase no configurado — push notifications deshabilitadas');
}

exports.sendPush = async (token, { title, body, data = {} }) => {
  if (!messaging || !token) return;

  try {
    await messaging.send({
      token,
      notification: { title, body },
      // FCM exige que los valores de data sean strings
      data: Object.fromEntries(
        Object.entries(data).map(([k, v]) => [k, String(v)])
      ),
    });
  } catch (err) {
    console.error('Push notification error:', err.message);
  }
};
