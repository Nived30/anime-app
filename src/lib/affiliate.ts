import { supabase } from './supabase';
import type { Affiliate, AffiliateClick, AffiliateConversion, AffiliateStats } from '../types';

// Cookie management
export function setAffiliateCookie(referralCode: string) {
  const expiryDate = new Date();
  expiryDate.setDate(expiryDate.getDate() + 30); // 30 days
  document.cookie = `affiliate_ref=${referralCode}; expires=${expiryDate.toUTCString()}; path=/; SameSite=Lax`;
}

export function getAffiliateCookie(): string | null {
  const cookies = document.cookie.split(';');
  for (let cookie of cookies) {
    const [name, value] = cookie.trim().split('=');
    if (name === 'affiliate_ref') {
      return value;
    }
  }
  return null;
}

export function clearAffiliateCookie() {
  document.cookie = 'affiliate_ref=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
}

// Affiliate management
export async function createAffiliate(userId: string): Promise<Affiliate> {
  try {
    const { data, error } = await supabase.rpc('generate_referral_code');
    if (error) throw error;

    const referralCode = data;

    const { data: affiliate, error: insertError } = await supabase
      .from('affiliates')
      .insert({
        user_id: userId,
        referral_code: referralCode
      })
      .select()
      .single();

    if (insertError) throw insertError;
    return mapAffiliateFromDb(affiliate);
  } catch (error) {
    console.error('Error creating affiliate:', error);
    throw error;
  }
}

export async function getAffiliateByCode(referralCode: string): Promise<Affiliate | null> {
  try {
    const { data, error } = await supabase
      .from('affiliates')
      .select('*')
      .eq('referral_code', referralCode)
      .eq('status', 'active')
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // No rows found
      throw error;
    }

    return mapAffiliateFromDb(data);
  } catch (error) {
    console.error('Error getting affiliate by code:', error);
    return null;
  }
}

export async function getAffiliateByUserId(userId: string): Promise<Affiliate | null> {
  try {
    const { data, error } = await supabase
      .from('affiliates')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // No rows found
      throw error;
    }

    return mapAffiliateFromDb(data);
  } catch (error) {
    console.error('Error getting affiliate by user ID:', error);
    return null;
  }
}

// Click tracking
export async function trackAffiliateClick(referralCode: string): Promise<void> {
  try {
    const affiliate = await getAffiliateByCode(referralCode);
    if (!affiliate) return;

    const { error } = await supabase
      .from('affiliate_clicks')
      .insert({
        affiliate_id: affiliate.id,
        ip_address: await getClientIP(),
        user_agent: navigator.userAgent,
        referrer: document.referrer || null
      });

    if (error) throw error;
  } catch (error) {
    console.error('Error tracking affiliate click:', error);
  }
}

// Conversion tracking
export async function trackAffiliateConversion(
  userId: string,
  conversionType: 'signup' | 'purchase',
  orderValue?: number
): Promise<void> {
  try {
    const referralCode = getAffiliateCookie();
    if (!referralCode) return;

    const affiliate = await getAffiliateByCode(referralCode);
    if (!affiliate) return;

    let commissionAmount = 0;
    if (conversionType === 'purchase' && orderValue) {
      commissionAmount = orderValue * affiliate.commissionRate;
    } else if (conversionType === 'signup') {
      commissionAmount = 5; // Fixed $5 for signups
    }

    const { error } = await supabase
      .from('affiliate_conversions')
      .insert({
        affiliate_id: affiliate.id,
        user_id: userId,
        conversion_type: conversionType,
        order_value: orderValue,
        commission_amount: commissionAmount
      });

    if (error) throw error;

    // Clear the cookie after successful conversion
    clearAffiliateCookie();
  } catch (error) {
    console.error('Error tracking affiliate conversion:', error);
  }
}

// Statistics
export async function getAffiliateStats(affiliateId: string): Promise<AffiliateStats> {
  try {
    // Get clicks
    const { data: clicks, error: clicksError } = await supabase
      .from('affiliate_clicks')
      .select('id')
      .eq('affiliate_id', affiliateId);

    if (clicksError) throw clicksError;

    // Get conversions
    const { data: conversions, error: conversionsError } = await supabase
      .from('affiliate_conversions')
      .select('*')
      .eq('affiliate_id', affiliateId);

    if (conversionsError) throw conversionsError;

    const totalClicks = clicks?.length || 0;
    const totalSignups = conversions?.filter(c => c.conversion_type === 'signup').length || 0;
    const totalPurchases = conversions?.filter(c => c.conversion_type === 'purchase').length || 0;
    const totalEarnings = conversions
      ?.filter(c => c.status === 'approved')
      .reduce((sum, c) => sum + (c.commission_amount || 0), 0) || 0;
    const pendingEarnings = conversions
      ?.filter(c => c.status === 'pending')
      .reduce((sum, c) => sum + (c.commission_amount || 0), 0) || 0;
    const conversionRate = totalClicks > 0 ? ((totalSignups + totalPurchases) / totalClicks) * 100 : 0;

    return {
      totalClicks,
      totalSignups,
      totalPurchases,
      totalEarnings,
      pendingEarnings,
      conversionRate
    };
  } catch (error) {
    console.error('Error getting affiliate stats:', error);
    throw error;
  }
}

export async function getAffiliateConversions(affiliateId: string): Promise<AffiliateConversion[]> {
  try {
    const { data, error } = await supabase
      .from('affiliate_conversions')
      .select('*')
      .eq('affiliate_id', affiliateId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data?.map(mapConversionFromDb) || [];
  } catch (error) {
    console.error('Error getting affiliate conversions:', error);
    return [];
  }
}

// Helper functions
async function getClientIP(): Promise<string> {
  try {
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    return data.ip;
  } catch {
    return 'unknown';
  }
}

function mapAffiliateFromDb(data: any): Affiliate {
  return {
    id: data.id,
    userId: data.user_id,
    referralCode: data.referral_code,
    commissionRate: parseFloat(data.commission_rate),
    totalEarnings: parseFloat(data.total_earnings),
    status: data.status,
    createdAt: data.created_at,
    updatedAt: data.updated_at
  };
}

function mapConversionFromDb(data: any): AffiliateConversion {
  return {
    id: data.id,
    affiliateId: data.affiliate_id,
    userId: data.user_id,
    conversionType: data.conversion_type,
    orderValue: data.order_value ? parseFloat(data.order_value) : undefined,
    commissionAmount: parseFloat(data.commission_amount),
    status: data.status,
    createdAt: data.created_at
  };
}