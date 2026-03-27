{\rtf1\ansi\ansicpg1252\cocoartf2868
\cocoatextscaling0\cocoaplatform0{\fonttbl\f0\fswiss\fcharset0 Helvetica;}
{\colortbl;\red255\green255\blue255;}
{\*\expandedcolortbl;;}
\paperw11900\paperh16840\margl1440\margr1440\vieww11520\viewh8400\viewkind0
\pard\tx720\tx1440\tx2160\tx2880\tx3600\tx4320\tx5040\tx5760\tx6480\tx7200\tx7920\tx8640\pardirnatural\partightenfactor0

\f0\fs24 \cf0 export default async function handler(req, res) \{\
    if (req.method !== 'POST') \{\
        return res.status(405).json(\{ error: 'Method not allowed' \});\
    \}\
\
    const \{ email, attributes, listIds \} = req.body;\
\
    if (!email) \{\
        return res.status(400).json(\{ error: 'Email is required' \});\
    \}\
\
    try \{\
        const response = await fetch('https://api.brevo.com/v3/contacts', \{\
            method: 'POST',\
            headers: \{\
                'Content-Type': 'application/json',\
                'api-key': process.env.BREVO_API_KEY\
            \},\
            body: JSON.stringify(\{\
                email,\
                attributes,\
                listIds,\
                updateEnabled: true\
            \})\
        \});\
\
        const data = await response.json();\
\
        return res.status(200).json(data);\
\
    \} catch (error) \{\
        return res.status(500).json(\{\
            error: 'Failed to send to Brevo',\
            details: error.message\
        \});\
    \}\
\}}