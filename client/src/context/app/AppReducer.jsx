export const appReducer = (state, action) => {
    switch (action.type) {
        case "SET_DO_FETCH_APPOINTMENTS":
            return {
                ...state,
                doFetchAppointments: action.payload,
            };
        default:
            return state;
    }
};
