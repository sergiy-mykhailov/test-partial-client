import { Sale as ISale, Improvement as IImprovement } from '../../types';

export const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr);

  const day = date.getDate();
  const month = date.getMonth() + 1;
  const year = date.getFullYear();

  return `${month} / ${day} / ${year}`;
};

export const formatCurrency = (n: number) => {
  if (!n) return '';
  return n.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,');
};

export const isOdd = (n: number): boolean => {
  return n % 2 === 1;
};

export const cellContentPerKey = (compSale: ISale, renderKey: keyof ISale): string | number => {
  const value = compSale[renderKey];

  switch (renderKey) {
    case 'sale_date':
      return formatDate(compSale.sale_date);
    case 'prior_sale_date':
      return formatDate(compSale.prior_sale_date);
    case 'comments':
      return compSale.comments ? compSale.comments.substr(0, 60) + '...' : '';
    case 'description':
      return compSale.description ? compSale.description.substr(0, 60) + '...' : '';
    case 'sale_price':
      return formatCurrency(compSale.sale_price);
    case 'cev_price':
      return formatCurrency(compSale.cev_price);
    case 'net_sale_price':
      return formatCurrency(compSale.net_sale_price);
    case 'sca_dollar_per_unit':
      return formatCurrency(compSale.sca_dollar_per_unit);
    case 'cost_per_acre':
      return formatCurrency(compSale.cost_per_acre);
    case 'improvements':
      let improvements = value as IImprovement[];
      let str = '';
      if (improvements)
        improvements.forEach(i => {
          if (i.name) str += i.name + ', ';
        });
      return str.slice(0, -2);
    default:
      return value as string;
  }
};
