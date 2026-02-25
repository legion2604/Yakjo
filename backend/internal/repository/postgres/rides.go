package postgres

import (
	"backend/internal/model"
	"database/sql"
	"time"
)

type rideRepository struct {
	db *sql.DB
}

type RideRepository interface {
	GetRides(from, to string, dateStart, dateEnd time.Time, seats int, sort string, limit, offset int) ([]model.Ride, error)
	GetRidesCount(from, to string, dateStart, dateEnd time.Time, seats int) (int, error)
	GetRideFullInfoById(id int) (model.FullInfoRide, error)
}

func NewRideRepository(db *sql.DB) RideRepository {
	return &rideRepository{db: db}
}

func (r *rideRepository) GetRides(from, to string, dateStart, dateEnd time.Time, seats int, sort string, limit, offset int) ([]model.Ride, error) {
	orderBy := getOrderBy(sort)

	row, err := r.db.Query(
		"SELECT r.id, r.from_city, r.to_city, r.price, r.departure_time, r.available_seats, u.id, u.first_name, u.rating, u.avatar_url, u.car_brand "+
			"FROM rides r "+
			"JOIN users u ON r.driver_id = u.id "+
			"WHERE r.from_city = $1 "+
			"AND r.to_city = $2 "+
			"AND r.departure_time >= $3 "+
			"AND r.departure_time < $4  "+
			"AND r.available_seats >= $5 "+
			"ORDER BY "+orderBy+" "+
			"LIMIT $6 OFFSET $7",
		from, to, dateStart, dateEnd, seats, limit, offset,
	)
	if err != nil {
		return []model.Ride{}, err
	}
	defer row.Close()
	var results []model.Ride

	for row.Next() {
		var result model.Ride
		err = row.Scan(&result.Id, &result.From, &result.To, &result.Price, &result.DepartureTime, &result.AvailableSeats, &result.Driver.Id, &result.Driver.FirstName, &result.Driver.Rating, &result.Driver.AvatarUrl, &result.Car)
		if err != nil {
			return []model.Ride{}, err
		}
		results = append(results, result)
	}
	return results, nil
}

func (r *rideRepository) GetRidesCount(from, to string, dateStart, dateEnd time.Time, seats int) (int, error) {
	var count int
	err := r.db.QueryRow(
		"SELECT COUNT(*) "+
			"FROM rides r "+
			"JOIN users u ON r.driver_id = u.id "+
			"WHERE r.from_city = $1 "+
			"AND r.to_city = $2 "+
			"AND r.departure_time >= $3 "+
			"AND r.departure_time < $4  "+
			"AND r.available_seats >= $5 ", from, to, dateStart, dateEnd, seats).Scan(&count)
	if err != nil {
		return 0, err
	}
	return count, nil
}

func (r *rideRepository) GetRideFullInfoById(id int) (model.FullInfoRide, error) {
	var fullInfo model.FullInfoRide
	fullInfo.Id = id
	row := r.db.QueryRow("SELECT r.from_city, r.to_city, r.description, r.price, r.available_seats, r.departure_time, u.id, u.first_name,u.last_name,u.rating "+
		"FROM rides r "+
		"JOIN users u ON u.id = r.driver_id "+
		"WHERE r.id=$1", id)
	err := row.Scan(
		&fullInfo.From,
		&fullInfo.To,
		&fullInfo.Description,
		&fullInfo.Price,
		&fullInfo.TotalSeats,
		&fullInfo.DepartureTime,
		&fullInfo.Driver.Id,
		&fullInfo.Driver.FirstName,
		&fullInfo.Driver.LastName,
		&fullInfo.Driver.Rating,
	)
	if err != nil {
		return model.FullInfoRide{}, err
	}
	return fullInfo, nil
}

/*
	{
	  "id": "ride-uuid",
	  "from": "Душанбе",
	  "to": "Худжанд",
	  "description": "Еду аккуратно, могу забрать с Водонасосной",
	  "price": 120,
	  "totalSeats": 4,
	  "availableSeats": 3,
	  "departureTime": "2024-02-25T08:00:00Z",
	  "driver": {
	    "id": "driver-uuid",
	    "firstName": "Алишер",
	    "lastName": "Валиев",
	    "rating": 4.8,
	    "contacts": { // Объект или null (если не авторизован)
	       "hidden": true // Флаг для фронта, чтобы показать "Войдите, чтобы увидеть"
	    }
	  }
	}
*/
func getOrderBy(sort string) string {
	switch sort {
	case "price_asc":
		return "price ASC"
	case "price_desc":
		return "price DESC"
	case "time_asc":
		return "departure_time ASC"
	default:
		return "departure_time ASC" // дефолт
	}
} // защита от SQL Injection
