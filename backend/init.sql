-- ------------------------ PASSENGERS ----------------------
CREATE TABLE IF NOT EXISTS PASSENGERS (
  Passenger_ID INT AUTO_INCREMENT PRIMARY KEY,
  Full_Name VARCHAR(100) NOT NULL,
  Phone VARCHAR(15) NOT NULL UNIQUE,
  Email VARCHAR(100) NOT NULL UNIQUE,
  Avg_Rating DECIMAL(2,1) DEFAULT 0,
  Created_At DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ------------------------ DRIVERS ------------------------
CREATE TABLE IF NOT EXISTS DRIVERS (
  Driver_ID INT AUTO_INCREMENT PRIMARY KEY,
  Full_Name VARCHAR(100) NOT NULL,
  License_No VARCHAR(20) NOT NULL UNIQUE,
  Phone VARCHAR(15) NOT NULL UNIQUE,
  Email VARCHAR(100) NOT NULL UNIQUE,
  Status ENUM('Active','Inactive','Suspended') NOT NULL DEFAULT 'Active',
  Join_Date DATE NOT NULL DEFAULT CURRENT_DATE,
  Avg_Rating DECIMAL(2,1) DEFAULT 0,
  Created_At DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ------------------------ VEHICLES ----------------------
CREATE TABLE IF NOT EXISTS VEHICLES (
  Vehicle_ID INT AUTO_INCREMENT PRIMARY KEY,
  Driver_ID INT NOT NULL,
  Model VARCHAR(50) NOT NULL,
  Capacity INT NOT NULL,
  Type ENUM('Car','Bike','Auto','SUV','Luxury') NOT NULL,
  Created_At DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (Driver_ID) REFERENCES DRIVERS(Driver_ID) ON DELETE CASCADE,
  CHECK (Capacity > 0)
);

-- ------------------------ ROUTES ----------------------
CREATE TABLE IF NOT EXISTS ROUTES (
  Route_ID INT AUTO_INCREMENT PRIMARY KEY,
  Start_Point VARCHAR(100) NOT NULL,
  End_Point VARCHAR(100) NOT NULL,
  Distance_km DECIMAL(6,2) NOT NULL,
  Duration_min INT NOT NULL,
  Created_At DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CHECK (Distance_km > 0),
  CHECK (Duration_min > 0),
  CHECK (Start_Point <> End_Point)
);

-- ------------------------ PROMOS ----------------------
CREATE TABLE IF NOT EXISTS PROMOS (
  Promo_ID INT AUTO_INCREMENT PRIMARY KEY,
  Code VARCHAR(20) NOT NULL UNIQUE,
  Description TEXT NULL,
  Expiry_Date DATE NOT NULL,
  Discount_Percent DECIMAL(5,2) NOT NULL,
  Min_Fare DECIMAL(10,2) NULL,
  Created_At DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CHECK (Discount_Percent >= 0 AND Discount_Percent <= 100),
  CHECK (Expiry_Date >= CURRENT_DATE)
);

-- ------------------------ RIDES ----------------------
CREATE TABLE IF NOT EXISTS RIDES (
  Ride_ID INT AUTO_INCREMENT PRIMARY KEY,
  Passenger_ID INT NOT NULL,
  Driver_ID INT NOT NULL,
  Route_ID INT NOT NULL,
  Vehicle_ID INT NULL,
  Applied_Promo_ID INT NULL,
  Fare DECIMAL(10,2) NULL,
  Status ENUM('Requested','Accepted','Ongoing','Completed','Cancelled') NOT NULL DEFAULT 'Requested',
  Created_At DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (Passenger_ID) REFERENCES PASSENGERS(Passenger_ID),
  FOREIGN KEY (Driver_ID) REFERENCES DRIVERS(Driver_ID),
  FOREIGN KEY (Route_ID) REFERENCES ROUTES(Route_ID),
  FOREIGN KEY (Vehicle_ID) REFERENCES VEHICLES(Vehicle_ID),
  FOREIGN KEY (Applied_Promo_ID) REFERENCES PROMOS(Promo_ID),
  CHECK (Fare IS NULL OR Fare >= 0)
);

-- ------------------------ PAYMENTS ----------------------
CREATE TABLE IF NOT EXISTS PAYMENTS (
  Payment_ID INT AUTO_INCREMENT PRIMARY KEY,
  Ride_ID INT NOT NULL UNIQUE,
  Amount DECIMAL(10,2) NOT NULL,
  Mode ENUM('Cash','Card','UPI','Wallet') NOT NULL,
  Status ENUM('Pending','Successful','Failed','Refunded') NOT NULL DEFAULT 'Pending',
  Payment_Date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (Ride_ID) REFERENCES RIDES(Ride_ID) ON DELETE CASCADE,
  CHECK (Amount >= 0)
);

-- ------------------------ FEEDBACK ----------------------
CREATE TABLE IF NOT EXISTS FEEDBACK (
  Feedback_ID INT AUTO_INCREMENT PRIMARY KEY,
  Ride_ID INT NOT NULL,
  Passenger_ID INT NOT NULL,
  Driver_ID INT NOT NULL,
  Author_Type ENUM('Passenger','Driver') NOT NULL,
  Rating DECIMAL(2,1) NOT NULL,
  Comments TEXT NULL,
  Created_At DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (Ride_ID) REFERENCES RIDES(Ride_ID) ON DELETE CASCADE,
  FOREIGN KEY (Passenger_ID) REFERENCES PASSENGERS(Passenger_ID) ON DELETE CASCADE,
  FOREIGN KEY (Driver_ID) REFERENCES DRIVERS(Driver_ID) ON DELETE CASCADE,
  CHECK (Rating >= 0 AND Rating <= 5)
);

-- ------------------------ INDEXES ----------------------
CREATE INDEX idx_rides_status ON RIDES(Status);
CREATE INDEX idx_routes_points ON ROUTES(Start_Point, End_Point);
CREATE INDEX idx_feedback_rating ON FEEDBACK(Rating);

-- ------------------------ VIEWS ----------------------

-- View to get ride details for passengers
CREATE VIEW Passenger_Rides_View AS
SELECT r.Ride_ID, r.Status AS Ride_Status, r.Fare, r.Created_At AS Ride_Created, 
       d.Full_Name AS Driver_Name, v.Model AS Vehicle_Model, 
       rt.Start_Point, rt.End_Point, rt.Distance_km, rt.Duration_min
FROM RIDES r
JOIN DRIVERS d ON r.Driver_ID = d.Driver_ID
JOIN VEHICLES v ON r.Vehicle_ID = v.Vehicle_ID
JOIN ROUTES rt ON r.Route_ID = rt.Route_ID;

-- View to get ride details for drivers
CREATE VIEW Driver_Rides_View AS
SELECT r.Ride_ID, r.Status AS Ride_Status, r.Fare, r.Created_At AS Ride_Created, 
       p.Full_Name AS Passenger_Name, v.Model AS Vehicle_Model, 
       rt.Start_Point, rt.End_Point, rt.Distance_km, rt.Duration_min
FROM RIDES r
JOIN PASSENGERS p ON r.Passenger_ID = p.Passenger_ID
JOIN VEHICLES v ON r.Vehicle_ID = v.Vehicle_ID
JOIN ROUTES rt ON r.Route_ID = rt.Route_ID;

-- ------------------------ TRIGGERS ----------------------

DELIMITER $$

-- Trigger to update the average ratings for passengers and drivers after feedback submission
CREATE TRIGGER trg_feedback_after_insert
AFTER INSERT ON FEEDBACK FOR EACH ROW
BEGIN
  -- Update average rating of passengers after feedback
  UPDATE PASSENGERS p
  JOIN (SELECT Passenger_ID, ROUND(AVG(Rating), 1) AS avg_rating
        FROM FEEDBACK WHERE Passenger_ID = NEW.Passenger_ID AND Author_Type = 'Driver') x
  ON x.Passenger_ID = p.Passenger_ID
  SET p.Avg_Rating = x.avg_rating;

  -- Update average rating of drivers after feedback
  UPDATE DRIVERS d
  JOIN (SELECT Driver_ID, ROUND(AVG(Rating), 1) AS avg_rating
        FROM FEEDBACK WHERE Driver_ID = NEW.Driver_ID AND Author_Type = 'Passenger') y
  ON y.Driver_ID = d.Driver_ID
  SET d.Avg_Rating = y.avg_rating;
END$$

-- Trigger to apply promo discount when a ride is created
CREATE TRIGGER trg_apply_promo_discount
BEFORE INSERT ON RIDES FOR EACH ROW
BEGIN
  DECLARE promo_discount DECIMAL(5,2);
  IF NEW.Applied_Promo_ID IS NOT NULL THEN
    SELECT Discount_Percent INTO promo_discount
    FROM PROMOS
    WHERE Promo_ID = NEW.Applied_Promo_ID AND Expiry_Date >= CURRENT_DATE;
    IF promo_discount IS NOT NULL THEN
      SET NEW.Fare = NEW.Fare * (1 - promo_discount / 100);
    END IF;
  END IF;
END$$


CREATE TRIGGER trg_update_driver_status_after_ride
AFTER UPDATE ON RIDES FOR EACH ROW
BEGIN
  IF NEW.Status = 'Completed' THEN
    UPDATE DRIVERS SET Is_Active = TRUE WHERE Driver_ID = NEW.Driver_ID;
  END IF;
END$$

CREATE TRIGGER trg_payment_update
AFTER UPDATE ON PAYMENTS FOR EACH ROW
BEGIN
  IF NEW.Status = 'Successful' THEN
  UPDATE RIDES SET Status = 'Completed' WHERE Ride_ID = NEW.Ride_ID;
  END IF;
END$$

DELIMITER ;






