import { useContext } from "react";
import { AuthContext } from "../components/AuthContext";
import CreateLeague from "../components/CreateLeague";
import JoinLeague from "../components/JoinLeague";
import LeaguesDisplay from "../components/LeaguesDisplay";

//Profile page
function Profile (){

    const { userDetails } = useContext(AuthContext);


    return(
        <div className="page-container">
            <div className="profile-container">
                <div className="page-heading">
                    <h1 className="page-title">PROFILE</h1>
                </div>
                <div className="details-container">
                    <h2>Welcome {userDetails.name || "Guest"}! </h2>
                </div>
                <div className="actions-container">
                    <CreateLeague />
                    <JoinLeague />
                </div>
                <div className="league-display-container">
                    <LeaguesDisplay />
                </div>
                
            </div>
        </div>

    )
}

export default Profile;