import type { History } from 'history';
import type { AxiosInstance, AxiosError } from 'axios';
import { createAsyncThunk } from '@reduxjs/toolkit';

import type {
  UserAuth,
  Offer,
  Comment,
  CommentAuth,
  FavoriteAuth,
  UserRegister,
  NewOffer,
  ApiOffer,
  ApiComment,
  ApiUser,
  CreateOfferRequest,
  UpdateOfferRequest,
  User,
} from '../types/types';
import { ApiRoute, AppRoute, HttpCode } from '../const';
import { Token } from '../utils';

type Extra = {
  api: AxiosInstance;
  history: History;
}

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL ?? 'http://localhost:4000';
const DEFAULT_AVATAR_URL = '/static/default-avatar.svg';

const getFileName = (path: string): string => path.split(/[\\/]/).pop() ?? path;

const getAvatarUrl = (avatarPath?: string): string => {
  if (!avatarPath) {
    return DEFAULT_AVATAR_URL;
  }

  if (avatarPath.startsWith('http')) {
    return avatarPath;
  }

  if (avatarPath.startsWith('/static/')) {
    return avatarPath;
  }

  if (avatarPath.startsWith('/upload/')) {
    return `${BACKEND_URL}${avatarPath}`;
  }

  const fileName = avatarPath.startsWith('file:') ? getFileName(avatarPath) : avatarPath;

  return `${BACKEND_URL}/upload/${getFileName(fileName)}`;
};

const getOfferImageUrl = (imagePath?: string): string => {
  if (!imagePath) {
    return '';
  }

  if (imagePath.startsWith('http')) {
    return imagePath;
  }

  if (imagePath.startsWith('/img/')) {
    return imagePath;
  }

  const fileName = imagePath.startsWith('file:') ? getFileName(imagePath) : imagePath;

  return `/img/${getFileName(fileName)}`;
};

const mapApiUser = (user: ApiUser): User => ({
  name: user.name,
  email: user.email,
  avatarUrl: getAvatarUrl(user.avatarPath),
  isPro: user.type === 'pro',
});

const mapApiOffer = (offer: ApiOffer): Offer => ({
  id: offer._id,
  price: offer.rentalPrice,
  rating: offer.rating,
  title: offer.title,
  isPremium: offer.isPremium,
  isFavorite: Boolean(offer.isFavorite),
  city: offer.city,
  location: offer.coordinates ?? offer.city.coordinates,
  previewImage: getOfferImageUrl(offer.previewPath),
  type: offer.type,
  bedrooms: offer.countRoom ?? 1,
  description: offer.description ?? '',
  goods: offer.conveniences ?? [],
  host: mapApiUser(offer.host ?? {
    id: '',
    name: '',
    email: '',
    avatarPath: '',
    type: 'default',
  }),
  images: (offer.images ?? [offer.previewPath, offer.previewPath, offer.previewPath, offer.previewPath, offer.previewPath, offer.previewPath])
    .map((imagePath) => getOfferImageUrl(imagePath)),
  maxAdults: offer.countGuest ?? 1,
});

const mapApiComment = (comment: ApiComment): Comment => ({
  id: comment.id,
  comment: comment.text,
  date: comment.datePublication,
  rating: comment.rating,
  user: mapApiUser(comment.author),
});

const mapNewOfferToRequest = (newOffer: NewOffer): CreateOfferRequest => ({
  title: newOffer.title,
  description: newOffer.description,
  publishDate: new Date().toISOString(),
  city: newOffer.city,
  previewImage: newOffer.previewImage,
  photos: [
    newOffer.previewImage,
    newOffer.previewImage,
    newOffer.previewImage,
    newOffer.previewImage,
    newOffer.previewImage,
    newOffer.previewImage,
  ],
  isPremium: newOffer.isPremium,
  rating: 1,
  type: newOffer.type,
  rooms: newOffer.bedrooms,
  guests: newOffer.maxAdults,
  price: newOffer.price,
  amenities: newOffer.goods,
  coordinates: newOffer.location,
  isFavorite: false
});

const mapOfferToUpdateRequest = (offer: Offer): UpdateOfferRequest => ({
  title: offer.title,
  description: offer.description,
  city: offer.city,
  previewImage: offer.previewImage,
  photos: offer.images,
  isPremium: offer.isPremium,
  rating: offer.rating,
  type: offer.type,
  rooms: offer.bedrooms,
  guests: offer.maxAdults,
  price: offer.price,
  amenities: offer.goods,
  coordinates: offer.location,
  isFavorite: false,
});

export const Action = {
  FETCH_OFFERS: 'offers/fetch',
  FETCH_OFFER: 'offer/fetch',
  POST_OFFER: 'offer/post-offer',
  EDIT_OFFER: 'offer/edit-offer',
  DELETE_OFFER: 'offer/delete-offer',
  FETCH_FAVORITE_OFFERS: 'offers/fetch-favorite',
  FETCH_PREMIUM_OFFERS: 'offers/fetch-premium',
  FETCH_COMMENTS: 'offer/fetch-comments',
  POST_COMMENT: 'offer/post-comment',
  POST_FAVORITE: 'offer/post-favorite',
  LOGIN_USER: 'login',
  LOGOUT_USER: 'logout',
  FETCH_USER_STATUS: 'users/status',
  REGISTER_USER: 'user/register',
  RESTORE_AUTH: '/users/restore'
};

export const fetchOffers = createAsyncThunk<Offer[], undefined, { extra: Extra }>(
  Action.FETCH_OFFERS,
  async (_, { extra }) => {
    const { api } = extra;
    const response = await api.get<{ status: string; message?: string; data: ApiOffer[] }>(ApiRoute.Offers);
    const apiOffers = response.data.data;
    return apiOffers.map(mapApiOffer);
  });

export const fetchFavoriteOffers = createAsyncThunk<Offer[], undefined, { extra: Extra }>(
  Action.FETCH_FAVORITE_OFFERS,
  async (_, { extra }) => {    
    console.log("fetchFavoriteOffers for ");
    const { api } = extra;
    const { data } = await api.get<ApiOffer[]>(ApiRoute.Favorites);
    console.log(data);

    return data.map(mapApiOffer);
  });

export const fetchOffer = createAsyncThunk<Offer, Offer['id'], { extra: Extra }>(
  Action.FETCH_OFFER,
  async (id, { extra }) => {
    const { api, history } = extra;

    try {
      const { data } = await api.get<{data: ApiOffer, message: string, status: string}>(`${ApiRoute.Offers}/${id}`);

      return mapApiOffer(data.data);
    } catch (error) {
      const axiosError = error as AxiosError;

      if (axiosError.response?.status === HttpCode.NotFound) {
        history.push(AppRoute.NotFound);
      }

      throw error;
    }
  });

export const postOffer = createAsyncThunk<void, NewOffer, { extra: Extra }>(
  Action.POST_OFFER,
  async (newOffer, { extra }) => {
    const { api, history } = extra;
    const payload = mapNewOfferToRequest(newOffer);
    const { data } = await api.post<ApiOffer>(ApiRoute.Offers, payload);
    history.push(`${AppRoute.Property}/${data._id}`);
  });

export const editOffer = createAsyncThunk<void, Offer, { extra: Extra }>(
  Action.EDIT_OFFER,
  async (offer, { extra }) => {
    const { api, history } = extra;
    const payload = mapOfferToUpdateRequest(offer);
    const { data } = await api.patch<ApiOffer>(`${ApiRoute.Offers}/${offer.id}`, payload);
    history.push(`${AppRoute.Property}/${data._id}`);
  });

export const deleteOffer = createAsyncThunk<void, string, { extra: Extra }>(
  Action.DELETE_OFFER,
  async (id, { extra }) => {
    const { api, history } = extra;
    await api.delete(`${ApiRoute.Offers}/${id}`);
    history.push(AppRoute.Root);
  });

export const fetchPremiumOffers = createAsyncThunk<Offer[], string, { extra: Extra }>(
  Action.FETCH_PREMIUM_OFFERS,
  async (cityName, { extra }) => {
    const { api } = extra;
    const { data } = await api.get<ApiOffer[]>(`${ApiRoute.Offers}/${ApiRoute.Premium}/${cityName}`);

    return data.map(mapApiOffer);
  });

export const fetchComments = createAsyncThunk<Comment[], Offer['id'], { extra: Extra }>(
  Action.FETCH_COMMENTS,
  async (id, { extra }) => {
    const { api } = extra;
    const { data } = await api.get<ApiComment[]>(`${ApiRoute.Offers}/${id}/${ApiRoute.Comments}`);

    return data.map(mapApiComment);
  });

export const fetchUserStatus = createAsyncThunk<UserAuth['email'], undefined, { extra: Extra }>(
  Action.FETCH_USER_STATUS,
  async (_, { extra }) => {
    const { api } = extra;

    try {
      const { data } = await api.get<ApiUser>(ApiRoute.Profile);

      return data.email;
    } catch (error) {
      const axiosError = error as AxiosError;

      if (axiosError.response?.status === HttpCode.NoAuth) {
        Token.drop();
      }

      throw error;
    }
  });

export const loginUser = createAsyncThunk<UserAuth['email'], UserAuth, { extra: Extra }>(
  Action.LOGIN_USER,
  async ({ email, password }, { extra }) => {
    const { api, history } = extra;
    const { data } = await api.post<{data: { email: string; token: string }; message: string; status: string}>(ApiRoute.Login, { email, password });
    const token = data.data.token;

    Token.save(token);
    history.push(AppRoute.Root);

    return email;
  });

export const restoreAuth = createAsyncThunk<
  UserAuth['email'],
  void,
  { extra: Extra; rejectValue: string }
>(
  Action.RESTORE_AUTH,
  async (_, { extra, rejectWithValue }) => {
    const { api } = extra;
    const token = Token.get();

    if (!token) {
      return rejectWithValue('No token found');
    }

    try {
      const { data } = await api.get(ApiRoute.Profile);
      return data.email;
    } catch (error) {
      Token.drop();
      return rejectWithValue('Token validation failed');
    }
  }
);



export const logoutUser = createAsyncThunk<void, undefined, { extra: Extra }>(
  Action.LOGOUT_USER,
  async (_, { extra }) => {
    const { api } = extra;
    await api.post(ApiRoute.Logout);

    Token.drop();
  });

export const registerUser = createAsyncThunk<void, UserRegister, { extra: Extra }>(
  Action.REGISTER_USER,
  async ({ email, password, name, avatar, type }, { extra }) => {
    const { api, history } = extra;
    await api.post(ApiRoute.Register, { email, password, name, type });

    if (avatar) {
      const { data } = await api.post<{ token: string }>(ApiRoute.Login, { email, password });
      Token.save(data.token);

      const payload = new FormData();
      payload.append('avatar', avatar);
      await api.post(ApiRoute.Avatar, payload, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      Token.drop();
    }

    history.push(AppRoute.Login);
  });


export const postComment = createAsyncThunk<Comment, CommentAuth, { extra: Extra }>(
  Action.POST_COMMENT,
  async ({ id, comment, rating }, { extra }) => {
    const { api } = extra;
    const { data } = await api.post<ApiComment>(`${ApiRoute.Offers}/${id}/${ApiRoute.Comments}`, { text: comment, rating });

    return mapApiComment(data);
  });

export const postFavorite = createAsyncThunk<Offer, FavoriteAuth, { extra: Extra }>(
  Action.POST_FAVORITE,
  async ({ id, status }, { extra }) => {
    const { api, history } = extra;

    try {
      const url = `${ApiRoute.Offers}/${ApiRoute.Favorite}/${id}`;
      const { data } = status === 1
        ? await api.post<ApiOffer>(url)
        : await api.delete<ApiOffer>(url);

      return mapApiOffer(data);
    } catch (error) {
      const axiosError = error as AxiosError;

      if (axiosError.response?.status === HttpCode.NoAuth) {
        history.push(AppRoute.Login);
      }

      throw error;
    }
  });

