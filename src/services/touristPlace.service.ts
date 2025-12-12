import axiosInstance from '@/lib/axios';
import { AxiosError } from 'axios';
import { API_ENDPOINTS } from '@/config/api.config';

export interface TouristPlaceCity {
  id: string;
  name: string;
  slug: string;
  region?: {
    id: string;
    name: string;
    slug: string;
    country?: {
      id: string;
      name: string;
      slug: string;
    };
  };
}

export interface TouristPlaceAttraction {
  id: string;
  name: string;
  image: string;
  rating?: number | null;
  description?: string | null;
  openTime?: string | null;
  closeTime?: string | null;
  status?: string | null;
  order: number;
}

export interface TouristPlaceBusinessSection {
  id: string;
  title: string;
  categoryIds: string[];
  order: number;
}

export interface TouristPlace {
  id: string;
  title: string;
  slug: string;
  subtitle?: string | null;
  galleryImages?: string[] | null;
  about?: string | null;
  metaTitle?: string | null;
  metaDescription?: string | null;
  keywords?: any;
  isActive: boolean;
  city: TouristPlaceCity;
  bestTimeToVisit?: {
    winter?: {
      label: string;
      months: string;
      season: string;
      points: string[];
    };
    summer?: {
      label: string;
      months: string;
      season: string;
      points: string[];
    };
    monsoon?: {
      label: string;
      months: string;
      season: string;
      points: string[];
    };
  } | null;
  attractions?: TouristPlaceAttraction[];
  businessSections?: TouristPlaceBusinessSection[];
  _count?: {
    attractions?: number;
    businessSections?: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

// Error handler
const handleError = (error: unknown): never => {
  if (error instanceof AxiosError) {
    const message = error.response?.data?.message || error.message || 'An error occurred';
    throw new Error(message);
  }
  throw error;
};

export const touristPlaceService = {
  // Public: Get all tourist places
  async getAll(params?: {
    limit?: number;
    page?: number;
    citySlug?: string;
    search?: string;
  }): Promise<TouristPlace[]> {
    try {
      const { limit = 10, page = 1, ...filters } = params ?? {};
      const response = await axiosInstance.get<ApiResponse<{
        touristPlaces: TouristPlace[];
        pagination: any;
      }>>(API_ENDPOINTS.TOURIST_PLACES.GET_ALL, {
        params: { limit, page, ...filters },
      });
      return response.data.data.touristPlaces || [];
    } catch (error) {
      return handleError(error);
    }
  },

  // Public: Get tourist place by slug
  async getBySlug(slug: string): Promise<TouristPlace> {
    try {
      const response = await axiosInstance.get<ApiResponse<TouristPlace>>(
        API_ENDPOINTS.TOURIST_PLACES.GET_BY_SLUG(slug)
      );
      return response.data.data;
    } catch (error) {
      return handleError(error);
    }
  },

  // Public: Get businesses for a tourist place section
  async getBusinesses(
    slug: string,
    sectionId: string,
    params?: {
      page?: number;
      limit?: number;
    }
  ): Promise<{
    businesses: any[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  }> {
    try {
      const { page = 1, limit = 10 } = params ?? {};
      const response = await axiosInstance.get<ApiResponse<{
        businesses: any[];
        pagination: any;
      }>>(API_ENDPOINTS.TOURIST_PLACES.GET_BUSINESSES(slug, sectionId), {
        params: { page, limit },
      });
      return response.data.data;
    } catch (error) {
      return handleError(error);
    }
  },

  // Admin: Get all tourist places (including inactive)
  async getAllAdmin(params?: {
    page?: number;
    limit?: number;
    cityId?: string;
    citySlug?: string;
    search?: string;
    isActive?: boolean;
  }): Promise<ApiResponse<{
    touristPlaces: TouristPlace[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  }>> {
    try {
      const response = await axiosInstance.get('/api/tourist-places/admin/all', { params });
      return response.data;
    } catch (error) {
      return handleError(error);
    }
  },

  // Admin: Get tourist place by slug (including inactive)
  async getBySlugAdmin(slug: string): Promise<TouristPlace> {
    try {
      const response = await axiosInstance.get<ApiResponse<TouristPlace>>(
        `/api/tourist-places/admin/slug/${slug}`
      );
      return response.data.data;
    } catch (error) {
      return handleError(error);
    }
  },

  // Admin: Create tourist place
  async create(formData: FormData): Promise<TouristPlace> {
    try {
      const response = await axiosInstance.post<ApiResponse<TouristPlace>>(
        API_ENDPOINTS.TOURIST_PLACES.CREATE,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      return response.data.data;
    } catch (error) {
      return handleError(error);
    }
  },

  // Admin: Update tourist place
  async update(id: string, formData: FormData): Promise<TouristPlace> {
    try {
      const response = await axiosInstance.put<ApiResponse<TouristPlace>>(
        API_ENDPOINTS.TOURIST_PLACES.UPDATE(id),
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      return response.data.data;
    } catch (error) {
      return handleError(error);
    }
  },

  // Admin: Delete tourist place
  async delete(id: string): Promise<void> {
    try {
      await axiosInstance.delete(API_ENDPOINTS.TOURIST_PLACES.DELETE(id));
    } catch (error) {
      return handleError(error);
    }
  },
};

