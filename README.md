# MediGuard AI

## Overview
MediGuard AI is an intelligent medical document analysis and prescription safety platform. It enables patients and healthcare providers to seamlessly upload, extract, and understand complex medical histories, lab results, and medication prescriptions while actively monitoring for safety risks.

## Problem
Patients often accumulate disjointed medical records across multiple visits, specialists, and clinics. This fragmentation leads to lost clinical context, overlooked lab trends, and critical medication interactions (such as being prescribed a drug despite a documented allergy in a previous visit).

## Solution
MediGuard AI unifies fragmented medical records by processing scanned documents and PDFs into structured medical data. It automatically builds a chronological health timeline, visualizes longitudinal lab trends, and cross-references active prescriptions against known allergies and drug interactions to ensure patient safety.

## Key Features

- **Document Analysis**: Seamlessly extracts structured clinical data from scanned documents, prescriptions, and lab reports.
- **Prescription Safety**: Automatically cross-references newly prescribed medications against a patient's historical allergies and existing drug regimens to flag potential adverse interactions.
- **Local Doctor Recommendation**: Intelligently identifies when a patient requires professional consultation (due to high-risk prescription flags or low-confidence AI extraction) and matches them with a specialized local healthcare professional or clinic based on proximity, rating, and availability using real-world public data APIs.
- **Medical Timeline**: Reconstructs a patient's journey chronologically, linking diagnoses, prescriptions, and lab tests across multiple visits and providers.
- **Lab Trends**: Tracks and visualizes key biomarkers over time, making it easy to identify deteriorating or improving health conditions.
- **Medical Assistant**: An intelligent assistant that helps users quickly query their medical history, understand changes in their health, and clarify medical terminology.
- **Smart Health Summary**: Generates a comprehensive, easily readable overview of a patient's current health status, active medications, and important clinical findings for sharing with healthcare professionals.

## Getting Started

1. Clone the repository
2. Run `npm install` to install dependencies
3. Set your API credentials in `.env.local`
4. Run `npm run dev` to start the development server
5. Open `http://localhost:3000` in your browser

## Usage

Simply drag and drop your medical documents (PDFs, JPGs, PNGs) into the Upload section. The system will automatically process the files, extract the relevant clinical information, and update your dashboard, timeline, and safety reports.

## Important Medical Disclaimer

**MediGuard AI is intended for informational and organizational purposes only.** 
It does not constitute professional medical diagnosis, advice, or treatment. The automated extraction and safety checks may occasionally produce inaccurate or incomplete results. Always consult a licensed healthcare professional, pharmacist, or doctor before altering medications, interpreting lab results, or making any clinical decisions based on the output of this software.
