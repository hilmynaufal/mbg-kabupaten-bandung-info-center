
import React from 'react';

export interface Feature {
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}

export interface FAQItem {
  question: string;
  answer: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export interface StatCard {
  label: string;
  value: string;
  icon: React.ReactNode;
  trend?: string;
}

export interface SppgUnit {
  nama: string;
  kecamatan: string;
  lokasi: string;
  desa: string;
  totalLaki: number;
  totalPerempuan: number;
  totalRealization: number;
}

export interface KecamatanComparison {
  name: string;
  target: number;
  realization: number;
  percentage: number;
  sppgCount: number;
}

export type ViewState = 'home' | 'capaian' | 'sppg' | 'sppg-detail';

// API Response Types
export interface RealizationApiResponse {
  total: number;
  data: Array<{
    detail: {
      kecamatan: string;
      desa: string;
      jumlah_lakilaki: string | number;
      jumlah_perempuan: string | number;
      nama_sppg?: string;
      lokasi_koordinat: string;
    }
  }>;
}

export interface TargetApiResponse {
  data: {
    info: Array<{
      nama: string;
      total: string;
    }>
  };
}

export interface PotensiItem {
  No: string;
  Wilayah: string;
  Total: string;
  TK: string;
  KB: string;
  SD: string;
  SMP: string;
  SMA: string;
  SMK: string;
  BALITA: string;
  BUMIL: string;
  BUSUI: string;
  id: number;
}

export interface PotensiApiResponse {
  status: string;
  data: {
    info: PotensiItem[];
  };
}
