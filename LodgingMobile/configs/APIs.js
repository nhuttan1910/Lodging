import axios from 'axios';
import querystring from 'querystring';


const BASE_URL = 'https://mtntuan.pythonanywhere.com/';

export const endpoints = {
    'user': '/user/',
    'current_user': '/user/current-user/',
    'owner': '/owner/',
    'current_owner': '/owner/current-owner/',
    'lodging': '/lodging/',
    'lodging_comment': (lodgingId) => `/lodging/${lodgingId}/comment_ul/`,
    'post': '/post/',
    'post_comment': (postId) => `/post/${postId}/comment/`,
    'follow': '/follow/',
    'follow_follower': (userId) => `/follow/${userId}/follower/`,
    'follow_following': (ownerId) => `/follow/${ownerId}/following/`,
    'comment_post': (postId) => `/comment/${postId}/comment_post/`,
    'comment_owner': '/comment/comment_owner/',
    'comment_lodging': (lodgingId) => `/comment_ul/${lodgingId}/comment_lodging/`,
    'comment_user': '/comment_ul/comment_user/',
    'login': '/o/token/',
};

export const authApi = (token) => {
    return axios.create({
        baseURL: BASE_URL,
        headers: {
            'Authorization': `Bearer ${token}`
        }

    });
};

export default axios.create({
    baseURL: BASE_URL
});