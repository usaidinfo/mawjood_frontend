import axiosInstance from '@/lib/axios';
import { AxiosError } from 'axios';

export enum EnquiryStatus {
  OPEN = 'OPEN',
  IN_PROGRESS = 'IN_PROGRESS',
  CLOSED = 'CLOSED',
  REJECTED = 'REJECTED',
}

export interface Enquiry {
  id: string;
  name: string;
  phone: string;
  email: string;
  message: string;
  status: EnquiryStatus;
  response?: string | null;
  responseDate?: string | null;
  userId: string;
  businessId: string;
  user?: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  };
  business?: {
    id: string;
    name: string;
    slug: string;
    email: string;
    phone: string;
    category?: {
      id: string;
      name: string;
      slug: string;
    };
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateEnquiryData {
  businessId: string;
  name: string;
  phone: string;
  email: string;
  message: string;
}

export interface UpdateEnquiryStatusData {
  status: EnquiryStatus;
  response?: string;
}

export interface EnquiryFilters {
  page?: number;
  limit?: number;
  status?: EnquiryStatus;
  search?: string;
  categoryId?: string;
  startDate?: string;
  endDate?: string;
}

export interface EnquiryListResponse {
  success: boolean;
  message: string;
  data: {
    enquiries: Enquiry[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  };
}

export interface EnquiryResponse {
  success: boolean;
  message: string;
  data: Enquiry;
}

class EnquiryService {
  /**
   * Create a new enquiry
   */
  async createEnquiry(data: CreateEnquiryData): Promise<Enquiry> {
    try {
      const response = await axiosInstance.post<EnquiryResponse>('/api/enquiries', data);
      return response.data.data;
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string }>;
      throw new Error(axiosError.response?.data?.message || 'Failed to create enquiry');
    }
  }

  /**
   * Get all enquiries (Admin only)
   */
  async getAllEnquiries(filters?: EnquiryFilters): Promise<EnquiryListResponse['data']> {
    try {
      const params = new URLSearchParams();
      if (filters?.page) params.append('page', filters.page.toString());
      if (filters?.limit) params.append('limit', filters.limit.toString());
      if (filters?.status) params.append('status', filters.status);
      if (filters?.search) params.append('search', filters.search);
      if (filters?.categoryId) params.append('categoryId', filters.categoryId);
      if (filters?.startDate) params.append('startDate', filters.startDate);
      if (filters?.endDate) params.append('endDate', filters.endDate);

      const response = await axiosInstance.get<EnquiryListResponse>(
        `/api/enquiries/admin/all?${params.toString()}`
      );
      return response.data.data;
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string }>;
      throw new Error(axiosError.response?.data?.message || 'Failed to fetch enquiries');
    }
  }

  /**
   * Get business enquiries (Business Owner)
   */
  async getBusinessEnquiries(filters?: EnquiryFilters): Promise<EnquiryListResponse['data']> {
    try {
      const params = new URLSearchParams();
      if (filters?.page) params.append('page', filters.page.toString());
      if (filters?.limit) params.append('limit', filters.limit.toString());
      if (filters?.status) params.append('status', filters.status);
      if (filters?.search) params.append('search', filters.search);
      if (filters?.startDate) params.append('startDate', filters.startDate);
      if (filters?.endDate) params.append('endDate', filters.endDate);

      const response = await axiosInstance.get<EnquiryListResponse>(
        `/api/enquiries/business?${params.toString()}`
      );
      return response.data.data;
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string }>;
      throw new Error(axiosError.response?.data?.message || 'Failed to fetch enquiries');
    }
  }

  /**
   * Get user's own enquiries
   */
  async getUserEnquiries(filters?: EnquiryFilters): Promise<EnquiryListResponse['data']> {
    try {
      const params = new URLSearchParams();
      if (filters?.page) params.append('page', filters.page.toString());
      if (filters?.limit) params.append('limit', filters.limit.toString());
      if (filters?.status) params.append('status', filters.status);

      const response = await axiosInstance.get<EnquiryListResponse>(
        `/api/enquiries/my-enquiries?${params.toString()}`
      );
      return response.data.data;
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string }>;
      throw new Error(axiosError.response?.data?.message || 'Failed to fetch enquiries');
    }
  }

  /**
   * Get enquiry by ID
   */
  async getEnquiryById(id: string): Promise<Enquiry> {
    try {
      const response = await axiosInstance.get<EnquiryResponse>(`/api/enquiries/${id}`);
      return response.data.data;
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string }>;
      throw new Error(axiosError.response?.data?.message || 'Failed to fetch enquiry');
    }
  }

  /**
   * Update enquiry status
   */
  async updateEnquiryStatus(
    id: string,
    data: UpdateEnquiryStatusData
  ): Promise<Enquiry> {
    try {
      const response = await axiosInstance.put<EnquiryResponse>(
        `/api/enquiries/${id}/status`,
        data
      );
      return response.data.data;
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string }>;
      throw new Error(axiosError.response?.data?.message || 'Failed to update enquiry');
    }
  }
}

export const enquiryService = new EnquiryService();

