import * as React from 'react';

const AppDataContext = React.createContext<AppDataValue>({} as AppDataValue);

function AppDataProvider({ children }: any) {
	const [exchangeRate, setExchangeRate] = React.useState<any>('0');

	const value: AppDataValue = {
		exchangeRate,
        setExchangeRate,
	};

	return (
		<AppDataContext.Provider value={value}>
			{children}
		</AppDataContext.Provider>
	);
}

interface AppDataValue {
	exchangeRate: any;
    setExchangeRate: React.Dispatch<React.SetStateAction<any>>;
}

export { AppDataProvider, AppDataContext };
