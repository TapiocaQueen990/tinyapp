const chai = require("chai");
const chaiHttp = require("chai-http");
const expect = chai.expect;

chai.use(chaiHttp);

describe("Login and Access Control Test", () => {
  const agent = chai.request.agent("http://localhost:8000");

  it('should return 403 status code for unauthorized access to "http://localhost:8000/urls/b2xVn2"', () => {
    // Step 1: Login with valid credentials
    return agent
      .post("/login")
      .send({ email: "user2@example.com", password: "dishwasher-funk" })
      .then((loginRes) => {
        // Step 2: Make a GET request to a protected resource
        return agent.get("/urls/b2xVn2").then((accessRes) => {
          // Step 3: Expect the status code to be 403
          expect(accessRes).to.have.status(403);
        });
      });
  });
  it('should redirect to login page for unauthorized access to "http://localhost:8000/"', () => {
    return agent.get("/").then((res) => {
      expect(res).to.redirect;
      expect(res).to.redirectTo("http://localhost:8000/login");
    });
  });
  it("Should return status code 404 to urls that dont exist", () => {
    return agent.get("/urls/NOTEXISTS").then((res) => {
      expect(res).to.have.status(403);
    });
  });
});
describe("Login and Access Control Test", () => {
  const agent = chai.request.agent("http://localhost:8000");
  it("should redirect to the login page if user requests /urls/new ", () => {
    return agent.get("/urls/new").then((res) => {
      expect(res).to.have.status(302);
      expect(res).to.redirectTo("http://localhost:8000/login");
    });
  });

  after(() => {
    agent.close();
  });
}); //end

// describe("redirect if not logged in ", () => {
//   it("should redirect user if theyre not logged in (status code 302)", () => {
//     const agent = chai.request.agent("http://localhost:8000");

//     return agent
//     .get("/")
//     .then((res) => {
//       expect(res).to.redirectTo('http://localhost:8000/login');
//       expect(res).to.have.status(302);
//     });
// });
//     })
