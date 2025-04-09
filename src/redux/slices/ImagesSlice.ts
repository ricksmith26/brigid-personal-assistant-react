import { createSlice,createAsyncThunk } from '@reduxjs/toolkit'
import type { RootState } from '../store'
import axiosIns from '../../providers/axiosIns';
import { AxiosResponse } from 'axios';

interface ImagesState {
  images: string[];
  photos: any[]
}

const initialState: ImagesState = {
    images: [],
    photos: []
   
}

const createImageBlob = async(response: AxiosResponse) => {
    return await Promise.all(
        response.data.images.filter(async (imageUrl: string) => {
          const imgResponse = await axiosIns.get(imageUrl, {
            responseType: 'blob',
          });
          if (imgResponse.status === 200) return URL.createObjectURL(imgResponse.data);
        })
      );
}

export const getImages = createAsyncThunk(
    'images/getImages',
    async () => {
        const response = await axiosIns.get(`${process.env.API_URL}/images/all`);

        const imageBlobs = await createImageBlob(response)
    
        return imageBlobs 
    }
  );

export const imagesSlice = createSlice({
  name: 'images',
  initialState,
  reducers: {
    addImages: (state, action) => {
      state.images = [...state.images, ...action.payload]
    },    
  },
  extraReducers: (builder) => {
    builder.addCase(getImages.fulfilled, (state, action) => {
        state.photos = [...state.photos, ...action.payload]
    })
  },
})

export const { addImages } = imagesSlice.actions

export const selectImages = (state: RootState) => state.imagesSlice.images
export const selectPhotos = (state: RootState) => state.imagesSlice.photos

export default imagesSlice.reducer