
import requests

def get_flight_status(flight_number):
    url = "https://opensky-network.org/api/states/all"

    try:
        response = requests.get(url, timeout=15)
        response.raise_for_status()

        data = response.json()
        states = data.get("states") or []

        for flight in states:
            callsign = (flight[1] or "").strip().replace(" ", "")

            if callsign.upper() == flight_number.upper().replace(" ", ""):
                return {
                    "flight_number": flight_number,
                    "callsign": callsign,
                    "longitude": flight[5],
                    "latitude": flight[6],
                    "on_ground": flight[8],
                    "velocity": flight[9],
                    "heading": flight[10],
                    "status": (
                        "On Ground" if flight[8]
                        else "Currently Flying"
                    )
                }

        return {
            "flight_number": flight_number,
            "message": "Live flight data not found"
        }

    except requests.RequestException as error:
        return {
            "error": str(error)
        }