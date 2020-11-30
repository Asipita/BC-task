const model = {
  token: "9b36f90d59c04016083d0b02da068c99cd6083ac",
  async fetchData() {
    const response = await fetch(`https://api.github.com/graphql`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.token}`,
      },
      body: JSON.stringify({
        query: `
        query {
          viewer {
            avatarUrl,
            followers{
              totalCount,
            },
            following{
              totalCount
            },
            login,
            company,
            email,
            location,
            websiteUrl,
            url,
            twitterUsername,
            name,
            bio,
            topRepositories(last: 20, orderBy: {field:CREATED_AT, direction: DESC}){
              totalCount,
              nodes{
                url,
                name,
                description,
                updatedAt,
                forkCount,
                stargazerCount,
                primaryLanguage{
                  name,
                  color
                }
              }
            }
          }
        }
      `,
      }),
    });

    const result = await response.json();
    return result;
  },

  async init() {
    this.setData(await this.fetchData());
  },
  setData(entry) {
    this.data = entry;
  },
  getData() {
    return this.data.data.viewer;
  },
  getRepositories() {
    const { totalCount, nodes } = this.getData().topRepositories;
    return { totalCount, repositories: nodes };
  },
};

const controller = {
  init: async () => {
    await model.init();
    view.init();
  },
  getBaseData: () => model.getData(),
  getRepositories: () => model.getRepositories(),
};

const view = {
  init() {
    this.renderBio();
    this.renderProfileImage();
    this.renderUserDetails();
    this.setRepositoriesCount();
    this.setRepositories();
    this.registerStickyBar();
  },

  registerStickyBar: () => {
    const menuBar = document.querySelector("#menu-bar");
    const smallProfile = document.querySelector(".small-user");

    window.onscroll = () => {
      if (
        document.documentElement.scrollTop > 150
      ) {
        menuBar.classList.add("fixed-full");
        smallProfile.classList.add("fixed");
        smallProfile.classList.remove("d-none");
      } else if (
        document.documentElement.scrollTop < 150
      ) {
        menuBar.classList.remove("fixed-full");
        smallProfile.classList.add("d-none");
      }
    };
  },

  renderProfileImage: () => {
    const { avatarUrl } = controller.getBaseData();
    const profileImage = document.createElement("img");
    profileImage.src = avatarUrl;
    profileImage.id = "profileImage";
    profileImage.style.width = "260";
    profileImage.style.height = "260";

    const smallProfileImage = document.querySelector("#smallProfileImage");
    smallProfileImage.src = avatarUrl;

    const imageContainer = document.querySelector("#image-container");
    imageContainer.append(profileImage);
  },

  renderBio: () => {
    const { bio } = controller.getBaseData();
    document.querySelector(".bio").innerText = bio;
  },

  renderUserDetails() {
    const {
      name,
      login,
      location,
      email,
      company,
      websiteUrl,
      twitterUsername,
    } = controller.getBaseData();
    const fullNameContainer = document.querySelector("#fullName");
    fullNameContainer.textContent = name;

    const userNameContainer = document.querySelector("#userName");
    userNameContainer.textContent = login;

    const otherDetailsContainer = document.querySelector("#other-details");

    const emailSection = this.createOtherDetailsSection("ion-email", email);
    const locationSection = this.createOtherDetailsSection(
      "ion-location",
      location
    );
    const companySection = this.createOtherDetailsSection("ion-home", company);
    const websiteSection = this.createOtherDetailsSection(
      "ion-link",
      websiteUrl,
      websiteUrl
    );
    const twitterSection = this.createOtherDetailsSection(
      "ion-social-twitter",
      twitterUsername,
      `https://www.twitter.com/${twitterUsername}`
    );

    otherDetailsContainer.append(
      emailSection,
      locationSection,
      companySection,
      websiteSection,
      twitterSection
    );
  },

  createOtherDetailsSection: (iconName, detailText, link) => {
    if (!detailText) return null;

    const icon = document.createElement("i");
    icon.classList.add(iconName, "mr-1");

    const detail = link
      ? document.createElement("a")
      : document.createElement("span");
    detail.innerText = detailText;

    if (link) {
      detail.href = link;
      detail.title = detailText;
    }

    const sectionContainer = document.createElement("div");
    sectionContainer.classList.add("my-1");
    if (link)
      sectionContainer.classList.add("my-1", "hover-blue", "hover-underline");

    sectionContainer.append(icon, detail);

    return sectionContainer;
  },

  setRepositoriesCount: () => {
    const { totalCount } = controller.getRepositories();
    const repositoriesCount = document.querySelector("#repositoriesCount");
    repositoriesCount.textContent = totalCount;
  },

  setRepositories() {
    const { repositories } = controller.getRepositories();
    for (const repo of repositories) {
      this.addRepoToCollection(repo);
    }
  },

  addRepoToCollection(repo) {
    const repositoryCollection = document.querySelector(
      ".repositories__collection"
    );

    const repository = this.createRepository(repo);
    repositoryCollection.append(repository);
  },

  createRepository(repo) {
    const repository = document.createElement("div");
    repository.classList.add("repository");

    repository.append(this.createRepositoryDetails(repo));
    repository.append(this.createStarButton());
    return repository;
  },

  createStarButton: () => {
    const starButtonSection = document.createElement("div");
    starButtonSection.classList.add("repository__starbutton");

    const starButton = document.createElement("button");
    const starButtonIcon = document.createElement("i");
    starButtonIcon.classList.add(
      "ion-android-star-outline",
      "mr-1",
      "text-1-2"
    );
    starButton.append(starButtonIcon, "Star");
    starButtonSection.append(starButton);

    return starButtonSection;
  },

  createRepositoryDetails({
    url,
    name,
    description,
    primaryLanguage,
    forkCount,
    updatedAt,
    stargazerCount,
  }) {
    const repositoryDetails = document.createElement("div");
    repositoryDetails.classList.add("repository__details");

    repositoryDetails.append(this.createRepositoryName(name, url));
    repositoryDetails.append(this.createDescription(description));

    repositoryDetails.append(
      this.createMetaData(primaryLanguage, forkCount, updatedAt, stargazerCount)
    );

    return repositoryDetails;
  },

  createMetaData(primaryLanguage, forkCount, updatedAt, stargazerCount) {
    const metaData = document.createElement("div");
    metaData.classList.add("repository__metadata");

    if (primaryLanguage) metaData.append(this.createLanguage(primaryLanguage));
    if (stargazerCount)
      metaData.append(this.createStargazerCount(stargazerCount));
    if (forkCount) metaData.append(this.createForkCount(forkCount));
    if (updatedAt) metaData.append(this.createUpdatedAt(updatedAt));
    return metaData;
  },

  monthsOfTheYear: [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ],

  createStargazerCount(count) {
    const stargazerSection = document.createElement("div");
    stargazerSection.classList.add("hover-blue");

    const starIcon = document.createElement("i");
    starIcon.classList.add("ion-android-star-outline", "text-1-2", "mr-1");

    const starCount = document.createElement("span");
    starCount.innerText = count;

    stargazerSection.append(starIcon, starCount);
    return stargazerSection;
  },

  createUpdatedAt(date) {
    const formatDate = new Date(date);
    const month = formatDate.getMonth();
    const day = formatDate.getDate();
    const year = formatDate.getFullYear();

    const currentYear = new Date().getFullYear();

    const updatedAtSection = document.createElement("div");
    updatedAtSection.classList.add("repository__metadata--lastUpdated");

    const updatedDate = document.createElement("span");
    updatedDate.innerText = `Updated on ${this.monthsOfTheYear[month]} ${day}${
      year !== currentYear ? ", " + year : ""
    }`;

    updatedAtSection.append(updatedDate);

    return updatedAtSection;
  },

  createLanguage: (language) => {
    const languageSection = document.createElement("div");
    languageSection.classList.add("repository__metadata--languages");

    const colorIcon = document.createElement("span");
    colorIcon.classList.add("circlify", "mr-1");
    colorIcon.style.backgroundColor = language.color;

    const colorName = document.createElement("span");
    colorName.classList.add("language");
    colorName.innerText = language.name;

    languageSection.append(colorIcon);
    languageSection.append(colorName);

    return languageSection;
  },

  createForkCount: (count) => {
    const forkSection = document.createElement("div");
    forkSection.classList.add("repository__metadata--forks", "hover-blue");

    const forkIcon = document.createElement("span");
    forkIcon.classList.add("ion-network", "mr-1", "text-1");

    const forkCount = document.createElement("span");
    forkCount.classList.add("language");
    forkCount.innerText = count;

    forkSection.append(forkIcon);
    forkSection.append(forkCount);

    return forkSection;
  },

  createDescription: (description) => {
    const repositoryDescription = document.createElement("div");
    repositoryDescription.classList.add("repository__details--description");
    repositoryDescription.innerText = description;
    return repositoryDescription;
  },

  createRepositoryName: (name, url) => {
    const repositoryName = document.createElement("a");
    repositoryName.classList.add("repository__name");
    repositoryName.href = url;
    repositoryName.innerText = name;
    return repositoryName;
  },
};

controller.init();
