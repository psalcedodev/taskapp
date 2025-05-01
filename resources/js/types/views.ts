import { FamilyChild } from './task';

export type DayViewState = {
  type: 'day';
};

export type ShopViewState = {
  type: 'shop';
  child: FamilyChild;
};

export type BankViewState = {
  type: 'bank';
  child: FamilyChild;
};

export type ViewState = DayViewState | ShopViewState | BankViewState;
