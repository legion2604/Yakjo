package postgres

import (
	"backend/internal/model"
	"database/sql"
	"log"
	"time"
)

type rideRepository struct {
	db *sql.DB
}

type RideRepository interface {
	GetRides(from, to string, dateStart, dateEnd time.Time, seats int, sort string, limit, offset int) ([]model.Ride, error)
	GetRidesCount(from, to string, dateStart, dateEnd time.Time, seats int) (int, error)
	GetRideFullInfoById(id int) (model.FullInfoRide, error)
	GetRideContacts(id int) (model.RideContacts, error)
	CreateRide(driverId int, ride model.RideForm) (int, error)
	GetRidesByUserId(userId int) ([]model.RideInfo, error)
	DeleteRideById(userId, rideId int) error
	ChangeRideById(userId, rideId int, newData model.ChangeRide) error
}

func NewRideRepository(db *sql.DB) RideRepository {
	return &rideRepository{db: db}
}

func (r *rideRepository) GetRides(from, to string, dateStart, dateEnd time.Time, seats int, sort string, limit, offset int) ([]model.Ride, error) {
	orderBy := getOrderBy(sort)
	log.Println(from, to, dateStart, dateEnd, seats, orderBy, limit, offset)
	row, err := r.db.Query(
		"SELECT r.id, r.from_city, r.to_city, r.price, r.departure_time, r.arrival_time, r.available_seats, u.id, u.first_name, u.rating, u.avatar_url, u.car_brand "+
			"FROM rides r "+
			"JOIN users u ON r.driver_id = u.id "+
			"WHERE (r.from_city = $1 OR $1 = '*')"+
			"AND (r.to_city = $2 OR $2 = '*')"+
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
		err = row.Scan(&result.Id, &result.From, &result.To, &result.Price, &result.DepartureTime, &result.ArrivalTime, &result.AvailableSeats, &result.Driver.Id, &result.Driver.FirstName, &result.Driver.Rating, &result.Driver.AvatarUrl, &result.Car)
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
	row := r.db.QueryRow("SELECT r.from_city, r.to_city, r.description, r.price, r.available_seats, r.departure_time, r.arrival_time, u.id, u.first_name,u.last_name,u.rating "+
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
		&fullInfo.ArrivalTime,
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

func (r *rideRepository) GetRideContacts(id int) (model.RideContacts, error) {
	var contacts model.RideContacts
	err := r.db.QueryRow("SELECT u.phone, u.telegram, u.whatsapp FROM users u JOIN rides r ON r.id=$1", id).Scan(&contacts.Phone, &contacts.Telegram, &contacts.Whatsapp)
	if err != nil {
		return model.RideContacts{}, err
	}
	return contacts, nil
}

func (r *rideRepository) CreateRide(driverId int, ride model.RideForm) (int, error) {
	var id int
	err := r.db.QueryRow("INSERT INTO rides (from_city, to_city,price, departure_time, arrival_time, available_seats,description,driver_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id", ride.From, ride.To, ride.Price, ride.DepartureTime, ride.ArrivalTime, ride.TotalSeats, ride.Description, driverId).Scan(&id)
	if err != nil {
		return 0, err
	}
	return id, nil
}

func (r *rideRepository) GetRidesByUserId(userId int) ([]model.RideInfo, error) {
	rows, err := r.db.Query("SELECT id,from_city,to_city, departure_time,arrival_time,price,available_seats,description,status FROM rides WHERE driver_id = $1", userId)
	if err != nil {
		return []model.RideInfo{}, err
	}
	results := []model.RideInfo{}
	for rows.Next() {
		var rideInfo model.RideInfo
		if err := rows.Scan(&rideInfo.Id, &rideInfo.From, &rideInfo.To, &rideInfo.DepartureTime, &rideInfo.ArrivalTime, &rideInfo.Price, &rideInfo.TotalSeats, &rideInfo.Description, &rideInfo.Status); err != nil {
			return []model.RideInfo{}, err
		}
		results = append(results, rideInfo)
	}
	defer rows.Close()
	return results, nil
}

func (r *rideRepository) DeleteRideById(userId, rideId int) error {
	_, err := r.db.Exec("DELETE FROM rides WHERE id = $1 AND driver_id = $2", rideId, userId)
	if err != nil {
		return err
	}
	return nil
}

func (r *rideRepository) ChangeRideById(userId, rideId int, newData model.ChangeRide) error {
	err := r.db.QueryRow("UPDATE rides SET from_city=$1, to_city=$2, departure_time=$3, arrival_time=$4, price=$5, available_seats=$6, description=$7 WHERE id=$8 AND	driver_id=$9", newData.From, newData.To, newData.DepartureTime, newData.ArrivalTime, newData.Price, newData.TotalSeats, newData.Description, rideId, userId)
	if err != nil {
		return err.Err()
	}
	return nil
}

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
/*
	From          string    `json:"from"`
	To            string    `json:"to"`
	DepartureTime time.Time `json:"departureTime"`
	ArrivalTime   time.Time `json:"arrivalTime"`
	Price         int       `json:"price"`
	TotalSeats    int       `json:"totalSeats"`
	Description   string    `json:"description"`

*/
