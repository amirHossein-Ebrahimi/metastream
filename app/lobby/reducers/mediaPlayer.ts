import { Reducer } from 'redux';
import { NetworkState } from 'types/network';
import { isType } from 'utils/redux';
import { addChat } from 'lobby/actions/chat';
import {
  setMedia,
  endMedia,
  playPauseMedia,
  seekMedia,
  queueMedia
} from 'lobby/actions/mediaPlayer';
import { ILobbyNetState } from 'lobby/reducers';

export const enum PlaybackState {
  Idle,
  Playing,
  Paused
}

export interface IMediaItem {
  url: string;

  // TODO: Make the following non-optional
  title?: string;

  /** Duration in ms */
  duration?: number;

  /** Thumbnail image */
  imageUrl?: string;

  /** Requester ID */
  ownerId?: string;

  /** Requester name, in case they disconnect */
  ownerName?: string;
}

export interface IMediaPlayerState {
  playback: PlaybackState;
  startTime?: number;
  pauseTime?: number;
  current?: IMediaItem;
  queue: IMediaItem[];
}

const initialState: IMediaPlayerState = {
  playback: PlaybackState.Idle,
  queue: []
};

export const mediaPlayer: Reducer<IMediaPlayerState> = (
  state: IMediaPlayerState = initialState,
  action: any
) => {
  if (isType(action, setMedia)) {
    return {
      ...state,
      playback: PlaybackState.Playing,
      current: action.payload,
      startTime: Date.now()
    };
  } else if (isType(action, endMedia)) {
    let next;
    let queue = state.queue;

    if (queue.length > 0) {
      queue = [...queue];
      next = queue.shift();
    }

    return {
      ...state,
      playback: next ? PlaybackState.Playing : PlaybackState.Idle,
      current: next,
      startTime: next ? Date.now() : undefined,
      queue: queue
    };
  } else if (isType(action, playPauseMedia)) {
    switch (state.playback) {
      case PlaybackState.Playing:
        return {
          ...state,
          playback: PlaybackState.Paused,
          pauseTime: action.payload
        };
      case PlaybackState.Paused:
        return {
          ...state,
          playback: PlaybackState.Playing,
          startTime: Date.now() - state.pauseTime!,
          pauseTime: undefined
        };
    }
  } else if (isType(action, seekMedia)) {
    const time = action.payload;
    switch (state.playback) {
      case PlaybackState.Playing:
        return {
          ...state,
          startTime: Date.now() - time
        };
      case PlaybackState.Paused:
        return {
          ...state,
          pauseTime: time
        };
    }
  } else if (isType(action, queueMedia)) {
    return {
      ...state,
      queue: [...state.queue, action.payload]
    };
  }

  return state;
};